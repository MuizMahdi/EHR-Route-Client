import { ErrorResponse } from 'src/app/Models/Payload/Responses/ErrorResponse';
import { ProviderAdditionRequest } from './../../../Models/Payload/Requests/ProviderAdditionRequest';
import { ProviderService } from './../../../Services/provider.service';
import { UsersService } from './../../../Services/users.service';
import { RoleChangeRequest } from './../../../Models/Payload/Requests/RoleChangeRequest';
import { MainLayoutService } from './../../../Services/main-layout.service';
import { Component } from '@angular/core';


@Component({
   selector: 'app-admin-panel',
   templateUrl: './admin-panel.component.html',
   styleUrls: ['./admin-panel.component.css']
})


export class AdminPanelComponent
{
   roleChangeAddress:string;
   selectedRoleChangeValue:string = "ROLE_PROVIDER"
   institutionProviderAddress:string;
   institutionName:string;


   constructor(
      private userService:UsersService, public mainLayout:MainLayoutService,
      private providerService:ProviderService
   ) { 
      this.mainLayout.show(); 
   }


   changeUserRole(address:string, role:string) {

      let roleChangeReq: RoleChangeRequest = {
         address,
         role
      }

      this.userService.changeUserRole(roleChangeReq).subscribe(

         response => {
            console.log(response);
         },

         error => {
            console.log(error);
         }

      );

   }


   registerInstitutionProvider(providerAddress:string, institutionName:string) {

      let request:ProviderAdditionRequest = {
         address: providerAddress,
         institutionName: institutionName
      }

      this.providerService.registerInstitutionProvider(request).subscribe(

         response => {
            console.log(response);
         },

         (error:ErrorResponse) => {
            console.log(error);
         }

      );

   }
}
