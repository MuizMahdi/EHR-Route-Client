import { UserInfo } from './../../../Models/Payload/Responses/UserInfo';
import { RoleName } from './../../../Models/RoleName';
import { ProviderService } from './../../../Services/provider.service';
import { AddressResponse } from './../../../Models/Payload/Responses/AddressResponse';
import { AddressService } from './../../../Services/address.service';
import { ErrorResponse } from './../../../Models/Payload/Responses/ErrorResponse';
import { UsersService } from './../../../Services/users.service';
import { UserLoginRequest } from '../../../Models/Payload/Requests/UserLoginRequest';
import { AuthService } from './../../../Services/auth.service';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { first, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})


export class LoginComponent
{
   loginFormGroup: FormGroup;

   loginUsernameOrEmail: string;
   loginPassword: string;


   constructor(
      private router:Router, private authService:AuthService, 
      private userService:UsersService, private addressService:AddressService,
      private providerService:ProviderService
   ) {
      this.buildForm();
   }


   private buildForm(): void
   {
      this.loginFormGroup = new FormGroup({
         usernameOrEmailCtrl: new FormControl(null, [Validators.required]),
         passwordCtrl: new FormControl(null, Validators.required)
      });
   }


   onLogin(): void
   {
      // LoginFormGroup values
      this.loginUsernameOrEmail = this.loginFormGroup.get("usernameOrEmailCtrl").value;
      this.loginPassword = this.loginFormGroup.get("passwordCtrl").value;

      const userInfo: UserLoginRequest = {
         usernameOrEmail: this.loginUsernameOrEmail,
         password: this.loginPassword
      };

      this.authService.login(userInfo).pipe(first(), 

         catchError(error => { 
            // Return the error to be handled on subscription
            return throwError(error);
         })

      ).subscribe(

         response => {
            this.router.navigate(['main']);
            this.checkIfFirstLogin();
            this.checkIfIsProvider();
         },
         
         (error:ErrorResponse) => {
            // TODO: Handle error by showing a flash message to user
            console.log(error);
         }

      );
   }


   private checkIfFirstLogin(): void
   {
      // When user info is received from server
      this.authService.currentUser.subscribe((userInfo:UserInfo) => {
         
         // If user is logged in
         if (userInfo) 
         {
            // check if its the user's first time login
            if (userInfo.firstLogin) {
               // Generate an address for the user
               this.generateUserAddress(userInfo);
            } 
         }

      });
   }


   private saveProviderAddress(): void
   {
      // Get current user ID
      let userID: number = this.authService.getCurrentUser().id;

      // Get user address
      this.addressService.getUserAddress(userID).then(address => {

         // If found
         if (address) 
         {
            // Save/set the address to provider details
            this.providerService.saveProviderAddress(address.address).subscribe(

               response => {
                  console.log(response);
               },

               (error:ErrorResponse) => {
                  console.log(error);
               }

            );
         }

      });
   }


   private generateUserAddress(userInfo:UserInfo): void
   {
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
            if (error.httpStatus == 409) {
               // Do nothing
            }
            else {
               console.log(error);
            }
         }

      );
   }


   private checkIfIsProvider(): void
   {
      this.authService.currentUser.subscribe((userInfo:UserInfo) => {

         // If user is logged in
         if (userInfo) 
         {
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


   private checkProviderAddress(): void
   {
      this.providerService.checkProviderAddressExistence().subscribe(

         (exists:boolean) => {
            if (!exists) {
               //this.saveProviderAddress();
            }
         },

         (error:ErrorResponse) => {
            console.log(error);
         }

      );
   }

}
