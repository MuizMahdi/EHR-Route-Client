import { InstitutionService } from './../../../Services/institution.service';
import { ApiResponse } from './../../../Models/Payload/Responses/ApiResponse';
import { ProviderInstitutionAdditionRequest } from './../../../Models/Payload/Requests/ProviderInstitutionAdditionRequest';
import { ErrorResponse } from 'src/app/Models/Payload/Responses/ErrorResponse';
import { ProviderAdditionRequest } from './../../../Models/Payload/Requests/ProviderAdditionRequest';
import { ProviderService } from './../../../Services/provider.service';
import { UsersService } from './../../../Services/users.service';
import { RoleChangeRequest } from './../../../Models/Payload/Requests/RoleChangeRequest';
import { MainLayoutService } from './../../../Services/main-layout.service';
import { Component } from '@angular/core';
import AppUtil from 'src/app/Helpers/Utils/AppUtil';


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
      private providerService:ProviderService, private institutionService:InstitutionService
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

      let request:ProviderInstitutionAdditionRequest = {
         address: providerAddress,
         institutionName: institutionName
      }

      this.providerService.registerInstitutionProvider(request).subscribe(
         (response:ApiResponse) => AppUtil.createMessage("success", response.message),
         (error:ErrorResponse) => AppUtil.createMessage("error", error.message)
      );
   }


   registerProvider(providerAddress:string) {

      let request:ProviderAdditionRequest = {
         address: providerAddress
      }

      this.institutionService.registerProvider(request).subscribe(
         (response:ApiResponse) => AppUtil.createMessage("success", response.message),
         (error:ErrorResponse) => AppUtil.createMessage("error", error.message)
      );
   }
}
