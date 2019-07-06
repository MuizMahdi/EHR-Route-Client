import { UserUpdateConsentResponse } from './../Models/Payload/Responses/UserUpdateConsentResponse';
import { UpdatedBlockAdditionRequest } from './../Models/Payload/Requests/UpdatedBlockAdditionRequest';
import { UserConsentResponse } from './../Models/Payload/Requests/UserConsentResponse';
import { first, catchError } from 'rxjs/operators';
import { environment } from './../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { BlockAdditionRequest } from './../Models/Payload/Requests/BlockAdditionRequest';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';


@Injectable({
   providedIn: 'root'
})


export class TransactionService 
{
   private ehrConsentRequestUrl:string = environment.apiUrl + '/transaction/record-consent-request';
   private ehrConsentResponseUrl:string = environment.apiUrl + '/transaction/record-consent-response';
   private ehrUpdateConsentRequestUrl:string = environment.apiUrl + '/transaction/record-update-consent-request';
   private ehrUpdateConsentResponseUrl:string = environment.apiUrl + '/transaction/record-update-consent-response';


   constructor(private http:HttpClient) 
   { }


   public sendUserEhrConsentRequest(blockAdditionRequest:BlockAdditionRequest): Observable<any> {

      return this.http.post(this.ehrConsentRequestUrl, blockAdditionRequest).pipe(first(),
         catchError(error => { return throwError(error) })
      );

   }


   public sendUserEhrConsentResponse(userConsentResponse:UserConsentResponse): Observable<any> {

      return this.http.post(this.ehrConsentResponseUrl, userConsentResponse).pipe(first(),
         catchError(error => { return throwError(error) })
      );

   }


   public sendEhrUpdateConsentRequest(updatedBlockRequest:UpdatedBlockAdditionRequest): Observable<any> {

      return this.http.post(this.ehrUpdateConsentRequestUrl, updatedBlockRequest).pipe(first(),
         catchError(error => { return throwError(error) })
      );

   }


   public sendUpdateEhrConsentResponse(updateConsentResponse:UserUpdateConsentResponse): Observable<any> {

      return this.http.post(this.ehrUpdateConsentResponseUrl, updateConsentResponse).pipe(first(),
         catchError(error => { return throwError(error) })
      );

   }
}
