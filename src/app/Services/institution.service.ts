import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from './../../environments/environment';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProviderAdditionRequest } from './../Models/Payload/Requests/ProviderAdditionRequest';


@Injectable({
   providedIn: 'root'
})


export class InstitutionService
{
   private registerProviderUrl:string = environment.apiUrl + '/institution/current/provider';

   constructor(private http:HttpClient) { }

   public registerProvider(providerAdditionRequest:ProviderAdditionRequest) {
      return this.http.post(this.registerProviderUrl, providerAdditionRequest).pipe(     
         catchError(error => { return throwError(error) })
      );
   }
}
