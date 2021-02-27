import { RoleName } from './../Models/RoleName';
import { UserInfo } from '../Models/Payload/Responses/UserInfo';
import { AppConfig } from './../../environments/environment';
import { UserLoginRequest } from '../Models/Payload/Requests/UserLoginRequest';
import { UserRegistrationRequest } from '../Models/Payload/Requests/UserRegistrationRequest';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { NodeClustersService } from './node-clusters.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AccessToken } from '../Models/App/AccessToken';


@Injectable({
   providedIn: 'root'
})


export class AuthService
{
   
   registrationUrl: string = AppConfig.apiUrl + '/auth/signup';
   loginUrl: string = AppConfig.apiUrl + '/auth/signin';
   currentUser: Subject<UserInfo> = new Subject<UserInfo>();
   isLoggedIn = new BehaviorSubject<boolean>(this.isTokenAvailable());
   jwtHelper = new JwtHelperService();


   constructor(
      private http: HttpClient, 
      private clustersService: NodeClustersService
   ) { }


   /* -------------------------------------------------------------------------- */
   /*                               Authentication                               */
   /* ---------------------------------e----------------------------------------- */
   //#region 

   public register(userRegistrationInfo: UserRegistrationRequest): Observable<any> {
      return this.http.post(this.registrationUrl, userRegistrationInfo);
   }


   public login(userLoginInfo: UserLoginRequest): Observable<any> {
      return this.http.post(this.loginUrl, userLoginInfo).pipe(
         tap(tokenResponse => {

            if (tokenResponse.accessToken) {

               // Store access token
               localStorage.setItem('accessToken', tokenResponse.accessToken);

               // Store user info
               let userInfo: UserInfo = this.mapTokenToUserInfo(this.getDecodedToken());
               localStorage.setItem('currentUser', JSON.stringify(userInfo));
               this.currentUser.next(userInfo);

               // Set user as logged in
               this.setIsLoggedIn(true);

               // Check user role and Initialize clusters
               this.initClusterSubscriptions();

            }

         })
      );
   }


   public async logout() {

      // If the user has provider role
      if (this.isUserProvider()) {

         // Unsubscribe user node from clusters
         this.clustersService.unsubscribeClusters().then(() => {

            // Remove user token
            localStorage.removeItem('accessToken');

            // Remove user info
            localStorage.removeItem('currentUser');

            // Set user as unauthenticated
            this.setIsLoggedIn(false);

            // Reset currentUser subject
            this.currentUser.next(null);
            this.currentUser = new Subject<any>();

         });

      }

   }

   //#endregion


   /* -------------------------------------------------------------------------- */
   /*                                Miscellaneous                               */
   /* -------------------------------------------------------------------------- */
   //#region 

   private mapTokenToUserInfo(accessToken: AccessToken): UserInfo {
      return {
         id: accessToken.sub,
         username: accessToken.email,
         name: '',
         email: accessToken.email,
         roles: accessToken.roles,
         firstLogin: accessToken.firstLogin,
         hasAddedInfo: accessToken.hasAddedInfo
      };
   }


   private initClusterSubscriptions(): void {

      let userRoles = this.getUserRoles();

      // Check if user has a provider role
      userRoles.forEach(role => {
         if (role == RoleName.PROVIDER) {
            // Subscribe user node to providers and consumers cluster
            this.clustersService.subscribeProvider();
            this.clustersService.subscribeConsumer();
         }
      });

   }


   public isUserProvider(): Boolean {

      let userRoles = this.getUserRoles();
      let isProvider = false;

      userRoles.forEach(role => {
         if (role === RoleName.PROVIDER) isProvider = true;
      });

      return isProvider;

   }

   //#endregion


   /* -------------------------------------------------------------------------- */
   /*                              Setters & Getters                             */
   /* -------------------------------------------------------------------------- */
   //#region 

   public getCurrentUser(): UserInfo {
      // Get user info from local storage
      return JSON.parse(localStorage.getItem('currentUser')) as UserInfo;
   }


   private isTokenAvailable(): boolean {
      return !!localStorage.getItem('accessToken');
   }


   setIsLoggedIn(isLoggedIn: boolean): void {
      this.isLoggedIn.next(isLoggedIn);
   }


   getIsLoggedIn(): BehaviorSubject<boolean> {
      return this.isLoggedIn;
   }


   public getDecodedToken(): AccessToken {
      return this.jwtHelper.decodeToken(localStorage.getItem('accessToken'));
   }


   public getUserRoles(): string[] {
      console.log('[Auth Service] Getting user roles...');
      return this.getDecodedToken()['roles'] as string[];
   }

   //#endregion

}
