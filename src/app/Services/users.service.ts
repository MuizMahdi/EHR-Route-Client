import { first, catchError } from 'rxjs/operators';
import { RoleChangeRequest } from './../Models/Payload/Requests/RoleChangeRequest';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable, throwError } from 'rxjs';


@Injectable({
  providedIn: 'root'
})


export class UsersService 
{
   private userUrl:string = environment.apiUrl + '/users/';   
   private userSearchUrl:string = this.userUrl + 'search-by-address';
   private userFirstLoginStatusUrl:string = this.userUrl + 'current/first-login-status';
   private userInfoAdditionStatusUrl:string = this.userUrl + 'current/info-addition-status';
   //TODO: Move to user controller instead of auth
   private userRoleChangeUrl:string = environment.apiUrl + '/auth/user-role-change';


   constructor(private http:HttpClient) {
   }


   public changeUserRole(roleChange:RoleChangeRequest): Observable<any> {

      return this.http.post(this.userRoleChangeUrl, roleChange).pipe(first(),

         catchError(error => {
            return throwError(error);
         })

      );

   }


   public searchAddress(address:string): Observable<any> {
      
      let searchUrl = this.userSearchUrl + "?keyword=" + address;

      return this.http.get(searchUrl).pipe(first(),
      
         catchError(error => {
            return throwError(error);
         })

      );
   }


   public getUserInfo(address:string): Observable<any> {

      let userGetUrl = this.userUrl + address;

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
