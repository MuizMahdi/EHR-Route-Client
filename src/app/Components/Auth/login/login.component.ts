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

   uiState = {
      isLoading: false,
      error: {
         isVisible: false,
         message: undefined,
      },
   };


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

      // Display loader
      this.uiState.isLoading = true;

      // Get credentials
      const userInfo: UserLoginRequest = this.loginFormGroup.value;

      this.authService.login(userInfo).subscribe(
         (res) => {

            // Conceal loader
            this.uiState.isLoading = false;

            // Navigate to dashboard
            this.router.navigate(['about-us']);

            // Generate user's address if its their first login
            this.generateUserAddress();

            
            this.checkIfIsProvider();

         },
         (err: ErrorResponse) => {

            // Display error alert
            this.uiState.error.isVisible = true;
            this.uiState.error.message = err.message;

            // Conceal loader
            this.uiState.isLoading = false;

         }
      );

   }


   private generateUserAddress(): void {

      let isUserFirstLogin = this.authService.getDecodedToken().firstLogin;
      let userRoles = this.authService.getUserRoles();

      if (isUserFirstLogin) {

         // Generate an address for the user to be saved on local DB
         this.addressService.generateUserAddress().subscribe(

            async (addressResponse: AddressResponse) => {

               console.log('New Address Fetched!');

               // Get current user id
               let userID: number = this.authService.getCurrentUser().id;

               // Persist address locally
               await this.addressService.saveUserAddress(addressResponse, userID);

               // If user is a provider, then add the generated address to their provider details
               userRoles.forEach(role => {
                  if (role === RoleName.PROVIDER) {
                     // Add the generated address to the provider's details
                     this.saveProviderAddress();
                  }
               });

            },
            (error:ErrorResponse) => {
               // If user already has an address (HTTP 409 Conflict)
               if (error.httpStatus == 409) { /* Do nothing */ }
               else console.log(error);
            }

         );

      }

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
         (exists: boolean) => { if (!exists) this.saveProviderAddress(); },
         (error: ErrorResponse) => console.log(error)
      );

   }


   private saveProviderAddress(): void {

      // Get current user ID
      let userID: number = this.authService.getCurrentUser().id;

      // Get user address
      this.addressService.getUserAddress(userID).then(address => {
         if (address) {
            // Save/set the address to provider details
            this.providerService.saveProviderAddress(address.address).subscribe(
               response => console.log(response),
               (error: ErrorResponse) => console.log(error)
            );
         }
      });

   }

}
