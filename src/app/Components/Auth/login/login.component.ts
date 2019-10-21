import { UserInfo } from './../../../Models/Payload/Responses/UserInfo';
import { RoleName } from './../../../Models/RoleName';
import { ProviderService } from './../../../Services/provider.service';
import { AddressResponse } from './../../../Models/Payload/Responses/AddressResponse';
import { AddressService } from './../../../Services/address.service';
import { ErrorResponse } from './../../../Models/Payload/Responses/ErrorResponse';
import { UserLoginRequest } from '../../../Models/Payload/Requests/UserLoginRequest';
import { AuthService } from './../../../Services/auth.service';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { first, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import AppUtil from 'src/app/Helpers/Utils/AppUtil';


@Component({
   selector: 'app-login',
   templateUrl: './login.component.html',
   styleUrls: ['./login.component.css']
})


export class LoginComponent
{
   loginFormGroup: FormGroup;
   loginAddressOrEmail: string;
   loginPassword: string;


   constructor(
      private router:Router, private authService:AuthService, 
      private addressService:AddressService, private providerService:ProviderService
   ) {
      this.buildForm();
   }


   private buildForm(): void {
      this.loginFormGroup = new FormGroup({
         addressOrEmailCtrl: new FormControl(null, [Validators.required]),
         passwordCtrl: new FormControl(null, Validators.required)
      });
   }


   onLogin(): void {
      this.loginAddressOrEmail = this.loginFormGroup.get("addressOrEmailCtrl").value;
      this.loginPassword = this.loginFormGroup.get("passwordCtrl").value;

      const userInfo: UserLoginRequest = {
         addressOrEmail: this.loginAddressOrEmail,
         password: this.loginPassword
      };

      this.authService.login(userInfo).pipe( 
         catchError(error => { return throwError(error) })
      ).subscribe(
         response => {
            this.router.navigate(['main']);
            this.checkIfFirstLogin();
            this.checkIfIsProvider();
         },
         (error:ErrorResponse) => AppUtil.createMessage("error", error.message)
      );
   }


   /**
    * Checks if its the user's first login and generates an address if it is.
    *
    * @private
    * @memberof LoginComponent
   */
   private checkIfFirstLogin(): void {
      // When user info is received from server
      this.authService.currentUser.subscribe((userInfo:UserInfo) => {
         // If user is logged in
         if (userInfo) {
            // check if its the user's first time login
            if (userInfo.firstLogin) {
               // Generate an address for the user
               this.generateUserAddress(userInfo);
            } 
         }
      });
   }


   /**
    * Sends a request to generate an address (address + crypto keys) and saves the response in the local DB
    *
    * @private
    * @param {UserInfo} userInfo The information object of the user who will get an address
    * @memberof LoginComponent
   */
   private generateUserAddress(userInfo:UserInfo): void {
      // Generate an address for the user to be saved on local DB
      this.addressService.generateUserAddress().subscribe(
         async (addressResponse:AddressResponse) => {
            // Get current user id
            let userID: number = this.authService.getCurrentUser().id;

            // Persist address locally
            await this.addressService.saveUserAddress(addressResponse, userID);

            // If user is a provider, then add the generated address to their provider details
            userInfo.roles.forEach(role => {
               if (role === RoleName.PROVIDER) {
                  // Add the generated address to the provider's details
                  this.saveProviderAddress();
               }
            });
         },
         (error:ErrorResponse) => {
            // If user already has an address (HTTP 409 Conflict)
            if (error.httpStatus == 409) { /*Do nothing*/ }
            else AppUtil.createMessage("error", error.message)
         }
      );
   }


   /**
    * Fetches the user address from local DB, and sends it to be saved on the user's provider details at server-side
    *
    * @private
    * @memberof LoginComponent
   */
   private saveProviderAddress(): void {
      // Get current user ID
      let userID: number = this.authService.getCurrentUser().id;

      // Get user address
      this.addressService.getUserAddress(userID).then(address => {
         // If found
         if (address) {
            // Save/set the address to provider details
            this.providerService.saveProviderAddress(address.address).subscribe(
               response => console.log(response),
               (error:ErrorResponse) => AppUtil.createMessage("error", error.message)
            );
         }
      });
   }


   /**
    * Checks if a user is a provider and checks their address existance on local DB
    *
    * @private
    * @memberof LoginComponent
   */
   private checkIfIsProvider(): void {
      this.authService.currentUser.subscribe((userInfo:UserInfo) => {
         // If user is logged in
         if (userInfo) {
            // Check the user roles
            userInfo.roles.forEach(role => {
               // If user has a ROLE_PROVIDER role
               if (role === RoleName.PROVIDER) {
                  // Check if user's address is saved
                  this.checkProviderAddress();
               }
            });
         }
      });
   }


   /**
    * Sends a request to check if the provider's address exist in the server-side DB
    *
    * @private
    * @memberof LoginComponent
   */
   private checkProviderAddress(): void {
      // Check if provider's address doesn't exist in the server-side DB
      this.providerService.checkProviderAddressExistence().subscribe(
         (exists:boolean) => {
            if (!exists) {
               // Send the locally stored address to the server
               this.saveProviderAddress();
            }
         },
         (error:ErrorResponse) => AppUtil.createMessage("error", error.message)
      );
   }
}
