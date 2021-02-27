import { RoleName } from './../../../Models/RoleName';
import { AuthService } from './../../../Services/auth.service';
import { AfterViewInit, Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})


export class SideBarComponent implements OnInit, AfterViewInit
{

   isProvider = false;
   isAdmin = false;


   constructor(
     private authService: AuthService
   ) { }


   ngOnInit() {
   }


   ngAfterViewInit(): void {
      this.checkUserRoles();
   }


   private checkUserRoles(): void {

      this.authService.getUserRoles().forEach(role => {
         if (role === RoleName.PROVIDER) this.isProvider = true;
         if (role === RoleName.ADMIN) this.isAdmin = true;
      });

   }
   
}
