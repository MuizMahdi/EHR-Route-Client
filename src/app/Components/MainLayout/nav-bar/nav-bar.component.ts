import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../Services/auth.service';


@Component({
   selector: 'app-nav-bar',
   templateUrl: './nav-bar.component.html',
   styleUrls: ['./nav-bar.component.css']
})


export class NavBarComponent implements OnInit {

   //#region States

   state = {
   };

   uiState = {
      username: undefined,
      innerWidth: undefined,
   };
   
   //#endregion


   constructor(
      private authService: AuthService,
   ) { }


   ngOnInit() {
      this.uiState.innerWidth = window.innerWidth;
      this.uiState.username = this.authService.getCurrentUser().email.split('@')[0];
   }

}
