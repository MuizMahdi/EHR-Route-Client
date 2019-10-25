import { UserInfo } from './../../../Models/Payload/Responses/UserInfo';
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
   isUserPatient: boolean = false;
   isUserProvider: boolean = false;
   isUserAdmin: boolean = false;


   constructor(private authService:AuthService) { }


   ngOnInit() {
      this.checkUserRoles();
   }


   private checkUserRoles(): void {
      this.authService.currentUser.subscribe((userInfo:UserInfo) => {
         if (userInfo) {
            userInfo.roles.forEach(role => {
               // User only => User
               if (!(role == RoleName.PROVIDER) && !(role == RoleName.ADMIN)) {
                  this.isUserPatient = true;
               }
               // User and Provider => Provider
               if (role === RoleName.PROVIDER) {
                  this.isUserProvider = true;
                  this.isUserPatient = false;
               }
               // User and Admin => Admin
               if (role === RoleName.ADMIN) {
                  this.isUserAdmin = true;
                  this.isUserPatient = false;
               }
            });
         }
      });
   }
}
