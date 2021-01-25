import { ProviderAdditionRequest } from './../Models/Payload/Requests/ProviderAdditionRequest';
import { SimpleStringPayload } from './../Models/Payload/Responses/SimpleStringPayload';
import { first, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { AppConfig } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})


export class ProviderService 
{

   private providerSearchUrl:string = AppConfig.apiUrl + '/providers/search-providers-by-username';
   private currentProviderUuidUrl:string = AppConfig.apiUrl + '/providers/current/uuid';
   private checkProviderAddressExistenceUrl:string = AppConfig.apiUrl + '/providers/current/address/exists';
   private providerAddressUrl:string = AppConfig.apiUrl + '/providers/current/address';
   private registerInstitutionProviderUrl:string = AppConfig.apiUrl + '/users/providers'


   constructor(private http:HttpClient) 
   { }


   public searchProviderUsername(username:string): Observable<any> {
      
      let searchUrl = this.providerSearchUrl + "?keyword=" + username;

      return this.http.get(searchUrl).pipe(first(),
      
         catchError(error => {
            return throwError(error);
         })

      );

   }


   public async getCurrentProviderUUID(): Promise<any> {

      return await this.http.get(this.currentProviderUuidUrl).pipe(first(),
      
         catchError(error => {
            return throwError(error);
         })

      ).toPromise();

   }


   public checkProviderAddressExistence(): Observable<any> {
      
      return this.http.get(this.checkProviderAddressExistenceUrl).pipe(first(),
      
         catchError(error => {
            return throwError(error);
         })
      
      );

   }


   public saveProviderAddress(address:string): Observable<any> {

      let addressPayload:SimpleStringPayload = {
         payload: address
      };

      return this.http.post(this.providerAddressUrl, addressPayload).pipe(first(),
      
         catchError(error => {
            return throwError(error);
         })
      
      );

   }


   public registerInstitutionProvider(providerAdditionRequest:ProviderAdditionRequest) {

      return this.http.post(this.registerInstitutionProviderUrl, providerAdditionRequest).pipe(first(),
      
         catchError(error => {
            return throwError(error);
         })
      
      );

   }

}
