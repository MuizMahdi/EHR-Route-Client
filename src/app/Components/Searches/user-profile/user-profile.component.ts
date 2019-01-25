import { Component, OnInit, Input } from '@angular/core';


@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})


export class UserProfileComponent implements OnInit
{
   // Searched username
   @Input() searchParameter: string;


   constructor() 
   { }


   ngOnInit()
   {
      if (this.searchParameter) {
         // Get user profile
         
      }
   }



}
