import { UserInfo } from './../../../Models/Payload/Responses/UserInfo';
import { RoleName } from './../../../Models/RoleName';
import { ProviderService } from './../../../Services/provider.service';
import { AddressResponse } from './../../../Models/Payload/Responses/AddressResponse';
import { AddressService } from './../../../Services/address.service';
import { ErrorResponse } from './../../../Models/Payload/Responses/ErrorResponse';
import { UserLoginRequest } from '../../../Models/Payload/Requests/UserLoginRequest';
import { AuthService } from './../../../Services/auth.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';


@Component({
   selector: 'app-login',
   templateUrl: './login.component.html',
   styleUrls: ['./login.component.css']
})


export class LoginComponent implements OnInit
{

   loginFormGroup: FormGroup;


   constructor(
      private router:Router, 
      private authService:AuthService, 
      private addressService:AddressService,
      private providerService:ProviderService
   ) { }



   ngOnInit(): void {
      this.buildForm();
   }


   private buildForm(): void {
      this.loginFormGroup = new FormGroup({
         addressOrEmail: new FormControl(null, [Validators.required]),
         password: new FormControl(null, [Validators.required])
      });
   }


   onLogin(): void {

      const userInfo: UserLoginRequest = this.loginFormGroup.value;

      this.authService.login(userInfo).subscribe(
         (res) => {
            this.router.navigate(['main']);
            this.checkIfFirstLogin();
            this.checkIfIsProvider();
         },
         (err: ErrorResponse) => {
            // TODO: Handle error by showing a flash message to user
            console.log(err);
         }
      );

   }


   private checkIfFirstLogin(): void {

      // When user info is received from server
      this.authService.currentUser.subscribe((userInfo:UserInfo) => {

         console.log('Checking user first login. UserInfo: ', userInfo);
         
         // If user is logged in
         if (userInfo) {
            // check if its the user's first time login
            if (userInfo.firstLogin) {

               console.log('It is the user`s first login!');

               // Generate an address for the user
               this.generateUserAddress(userInfo);
            } 
         }

      });

   }


   private generateUserAddress(userInfo:UserInfo): void {

      console.log('Fetching new address...');

      // Generate an address for the user to be saved on local DB
      this.addressService.generateUserAddress().subscribe(

         async (addressResponse:AddressResponse) => {

            console.log('New Address Fetched!');

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


   private checkIfIsProvider(): void {

      this.authService.currentUser.subscribe((userInfo:UserInfo) => {

         // If user is logged in
         if (userInfo) {
            userInfo.roles.forEach(role => {
               // If user has a Provider role, then check if user's address is saved
               if (role === RoleName.PROVIDER) this.checkProviderAddress();
            });
         }

      });

   }


   private checkProviderAddress(): void {

      this.providerService.checkProviderAddressExistence().subscribe(

         (exists:boolean) => {
            if (!exists) {
               this.saveProviderAddress();
            }
         },

         (error:ErrorResponse) => {
            console.log(error);
         }

      );

   }


   private saveProviderAddress(): void {

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

}
