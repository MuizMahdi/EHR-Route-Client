import { ErrorResponse } from './../Models/Payload/Responses/ErrorResponse';
import { UserInfo } from './../Models/Payload/Responses/UserInfo';
import { AuthService } from './auth.service';
import { Address } from './../DataAccess/entities/Core/Address';
import { Connection } from 'typeorm';
import { AddressResponse } from './../Models/Payload/Responses/AddressResponse';
import { HttpClient } from '@angular/common/http';
import { DatabaseService } from './../DataAccess/database.service';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { first, catchError } from 'rxjs/operators';
import ModelMapper from '../Helpers/Utils/ModelMapper';


@Injectable({
  providedIn: 'root'
})


export class AddressService 
{
   private addressGenerationUrl:string = environment.apiUrl + '/address/generate';


   constructor(
      private dbService:DatabaseService, private http:HttpClient, 
   ) { }


   public async ensureAddressDbConnection(userID:number)
   {
      // Get user's address DB connection
      try
      {
         this.dbService.getAddressDbConnection(userID);
      }
      catch (error)
      {
         // If no connection for network's DB is available, then create a connection
         if ( (<Error>error).name == 'ConnectionNotFoundError' ) {
            await this.dbService.createAddressDbConnection(userID);
         }
         else {
            console.log(error);
         }
      }
   }


   public generateUserAddress(): Observable<any>
   {
      return this.http.get(this.addressGenerationUrl).pipe(first(),

         catchError(error => {
            return throwError(error);
         })

      );
   }


   public async getUserAddress(userID:number): Promise<Address>
   {
      try
      {
         // Create an address DB/Connection
         await this.dbService.createAddressDbConnection(userID);
      }
      catch(error)
      {
         // Create an address DB/Connection
         await this.ensureAddressDbConnection(userID);
      }
      
      // Get user's address DB connection
      const dbConnection:Connection = await this.dbService.getAddressDbConnection(userID);

      const address:Address = await dbConnection.manager.findOne(Address, 1);

      return address;
   }


   public async saveUserAddress(addressResponse:AddressResponse, userID:number)
   {
      // Make sure that a connection to the address DB has been created
      this.ensureAddressDbConnection(userID);

      // Get the connection
      const dbConnection:Connection = this.dbService.getAddressDbConnection(userID);

      // Map the address response to address
      let address:Address = ModelMapper.mapAddressResponseToAddress(addressResponse);

      // Persist the address response data
      await dbConnection.manager.save(address);
   }
}
