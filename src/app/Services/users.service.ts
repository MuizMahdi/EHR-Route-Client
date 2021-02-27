import { first, catchError } from 'rxjs/operators';
import { RoleChangeRequest } from './../Models/Payload/Requests/RoleChangeRequest';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfig } from '../../environments/environment';
import { Observable, throwError } from 'rxjs';


@Injectable({
  providedIn: 'root'
})


export class UsersService 
{
   
   private userRoleChangeUrl:string = AppConfig.apiUrl + '/auth/user-role-change';
   private userSearchUrl:string = AppConfig.apiUrl + '/users/search-by-address';
   private getUserInfoUrl:string = AppConfig.apiUrl + '/users/find-by-email/';
   private userFirstLoginStatusUrl:string = AppConfig.apiUrl + '/users/current/first-login-status';
   private userInfoAdditionStatusUrl:string = AppConfig.apiUrl + '/users/current/info-addition-status';


   constructor(private http:HttpClient) {
   }


   public changeUserRole(roleChange:RoleChangeRequest): Observable<any> {

      return this.http.post(this.userRoleChangeUrl, roleChange).pipe(first(),

         catchError(error => {
            return throwError(error);
         })

      );

   }


   public searchUsername(username:string): Observable<any> {
      
      let searchUrl = this.userSearchUrl + "?keyword=" + username;

      return this.http.get(searchUrl).pipe(first(),
      
         catchError(error => {
            return throwError(error);
         })

      );
   }


   public getUserInfo(username:string): Observable<any> {

      let userGetUrl = this.getUserInfoUrl + username;

      return this.http.get(userGetUrl).pipe(first(),
      
         catchError(error => {
            return throwError(error);
         })

      );

   }


   public getCurrentUserFirstLoginStatus(): Observable<any>
   {
      return this.http.get(this.userFirstLoginStatusUrl).pipe(first(),

         catchError(error => {
            return throwError(error);
         })

      );
   }


   public updateUserInfoAdditionStatus(): Observable<any>
   {
      let url = this.userInfoAdditionStatusUrl;

      return this.http.post(url, "").pipe(first(),
      
         catchError(error => {
            return throwError(error);
         })

      );
   }
}
