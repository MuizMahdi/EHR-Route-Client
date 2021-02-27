import { ErrorResponse } from '../../../Models/Payload/Responses/ErrorResponse';
import { ProviderAdditionRequest } from './../../../Models/Payload/Requests/ProviderAdditionRequest';
import { ProviderService } from './../../../Services/provider.service';
import { UsersService } from './../../../Services/users.service';
import { RoleChangeRequest } from './../../../Models/Payload/Requests/RoleChangeRequest';
import { MainLayoutService } from './../../../Services/main-layout.service';
import { Component } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';


@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})


export class AdminPanelComponent
{
   roleChangeUsername:string;
   selectedRoleChangeValue:string = "ROLE_PROVIDER"

   institutionProviderUsername:string;
   institutionName:string;

   isRegisteringProvider = false;
   isChangingRole = false;


   constructor(
      private userService: UsersService, 
      public mainLayout: MainLayoutService,
      private providerService: ProviderService,
      private messageService: NzMessageService
   ) { 
      this.mainLayout.show(); 
   }


   changeUserRole(username:string, role:string) {

      this.isChangingRole = true;

      let roleChangeReq:RoleChangeRequest = {
         username,
         role
      }

      this.userService.changeUserRole(roleChangeReq).subscribe(

         response => {
            console.log(response);
            this.messageService.success("User Role Assigned Successfully");
            this.isChangingRole = false;
         },

         error => {
            console.log(error);
            this.messageService.error("Error Assigning Use Role");
            this.isChangingRole = false;
         }

      );

   }


   registerInstitutionProvider(providerUsername:string, institutionName:string) {

      this.isRegisteringProvider = true;

      let request: ProviderAdditionRequest = {
         address: providerUsername,
         institutionName: institutionName
      }

      this.providerService.registerInstitutionProvider(request).subscribe(

         response => {
            console.log(response);
            this.messageService.success('Institution Provider Registered Successfully');
            this.isRegisteringProvider = false;
         },

         (error:ErrorResponse) => {
            console.log(error);
            this.messageService.error('Institution Provider Registration Failed');
            this.isRegisteringProvider = false;
         }

      );

   }
}
