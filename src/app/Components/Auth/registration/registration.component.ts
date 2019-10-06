import { UserRegistrationRequest } from '../../../Models/Payload/Requests/UserRegistrationRequest';
import { AuthService } from './../../../Services/auth.service';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';


@Component({
   selector: 'app-registration',
   templateUrl: './registration.component.html',
   styleUrls: ['./registration.component.css']
})


export class RegistrationComponent 
{
   registrationFormGroup:FormGroup;

   registrationEmail:string;
   registrationPassword:string;

   constructor(private router:Router, private authService:AuthService) {
      this.buildForm();
   }

   buildForm(): void
   {
      this.registrationFormGroup = new FormGroup({
         emailCtrl: new FormControl(null, [Validators.required]),
         passwordCtrl: new FormControl(null, [Validators.required])
      });
   }

   onRegistration() 
   {
      // Form values
      this.registrationEmail = this.registrationFormGroup.get("emailCtrl").value;
      this.registrationPassword = this.registrationFormGroup.get("passwordCtrl").value;

      let userRegistrationRequest:UserRegistrationRequest = {
         email: this.registrationEmail,
         password: this.registrationPassword
      }

      this.authService.register(userRegistrationRequest).pipe(

         catchError(error => {
            return throwError(error);
         })

      ).subscribe(

         response => {
            // TODO: Navigate to login page after showing a message telling user to validate email
            console.log("Registered");
         },

         errorResponse => {
            // TODO: Handle error by showing a flash message to user
            console.log(errorResponse);
         }

      );
   }

}
