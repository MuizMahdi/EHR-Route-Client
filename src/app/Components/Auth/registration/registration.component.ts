import { UserRegistrationRequest } from '../../../Models/Payload/Requests/UserRegistrationRequest';
import { AuthService } from './../../../Services/auth.service';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';


@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})


export class RegistrationComponent implements OnInit
{
   
   @Output() hasRegistered: EventEmitter<boolean> = new EventEmitter<boolean>(false);
   registrationFormGroup:FormGroup;

   uiState = {
     isLoading: false,
     error: {
       isVisible: false,
       message: undefined,
     },
   };


   constructor(
      private authService:AuthService
   ) { }


   ngOnInit(): void {
      this.buildForm();
   }


   buildForm(): void {
      this.registrationFormGroup = new FormGroup({
         name: new FormControl(null, [Validators.required]),
         username: new FormControl(null, [Validators.required]),
         email: new FormControl(null, [Validators.required]),
         password: new FormControl(null, [Validators.required])
      });
   }


   onRegistration() {

     // Display loader
     this.uiState.isLoading = true;

      let userRegistrationRequest:UserRegistrationRequest = this.registrationFormGroup.value;

      this.authService.register(userRegistrationRequest).subscribe(
         res => {
           this.uiState.isLoading = false;
           this.hasRegistered.emit(true);
         },
         err => {
           console.log(err);
           this.uiState.isLoading = false;
         }
      );

   }

}
