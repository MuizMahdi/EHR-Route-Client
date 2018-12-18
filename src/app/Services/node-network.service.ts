import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { catchError, first } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})


export class NodeNetworkService 
{
   userNetworkUrl:string = environment.apiUrl + '/users/current/networks';
   createNetworkUrl:string = environment.apiUrl + '/network/create'

   
   constructor(private http:HttpClient) { }


   getUserNetworks(): Observable<any> {
      
      return this.http.get(this.userNetworkUrl).pipe(first(),

         catchError( error => {
            return throwError(error);
         })

      );

   }

   generateNetwork(): Observable<any> {

      return this.http.get(this.createNetworkUrl).pipe(first(),
         
      catchError( error => {
         return throwError(error);
      })

      );

   }

}