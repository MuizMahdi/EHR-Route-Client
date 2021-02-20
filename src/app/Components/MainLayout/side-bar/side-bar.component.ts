import { RoleName } from './../../../Models/RoleName';
import { AuthService } from './../../../Services/auth.service';
import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})


export class SideBarComponent implements OnInit 
{

   isUserProviderOrAdmin: boolean = false;


   constructor(
     private authService: AuthService
   ) { }


   ngOnInit() {
      this.checkUserRoles();
   }


   private checkUserRoles(): void {

      this.authService.getUserRoles().forEach(role => {
         if (role === RoleName.PROVIDER || role === RoleName.ADMIN) this.isUserProviderOrAdmin = true;
      });

   }
   
}
