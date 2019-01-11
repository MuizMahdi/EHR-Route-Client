import { UserNetworks } from '../../Models/Payload/Responses/UserNetworks';
import { NodeNetworkService } from './../../Services/node-network.service';
import { UserRole } from './../../Models/UserRole';
import { MainLayoutService } from './../../Services/main-layout.service';
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/Services/auth.service';
import { NetworkInfo } from 'src/app/Models/Payload/Responses/NetworkInfo';
import { NzModalService } from 'ng-zorro-antd';
import { NodeClustersService } from 'src/app/Services/node-clusters.service';
import { ErrorResponse } from 'src/app/Models/Payload/Responses/ErrorResponse';
import { NetworkInvitationRequest } from 'src/app/Models/Payload/Requests/NetworkInvitationRequest';


@Component({
  selector: 'app-network-manager',
  templateUrl: './network-manager.component.html',
  styleUrls: ['./network-manager.component.css']
})


export class NetworkManagerComponent implements OnInit 
{
   isAdmin:boolean = false;
   isProvider:boolean = false;

   selectedNetwork:any = {};
   selectedNetworkUUID:string;
   userNetworks:NetworkInfo[];
   userHasNetwork:boolean = false;

   newNetworkName:string;
   isNetworkCreationModalVisible:boolean = false;

   invitedUserUsername:string;


   constructor(
      private nodeNetworkService:NodeNetworkService, private authService:AuthService, 
      public mainLayout:MainLayoutService, private modalService:NzModalService,
      private nodeClusterService:NodeClustersService
   ) { }


   ngOnInit():void 
   {
      this.mainLayout.show();
      this.initUserRole();
      this.getUserNetworks();
   }


   initUserRole():void 
   {
      // Get user roles
      this.authService.getCurrentUserRoles().subscribe(

         (roles:UserRole[]) => {

            // Iterate through the roles array and set role flags
            roles.forEach(role => {
               if (role.roleName.trim() === 'ROLE_ADMIN') this.isAdmin = true; 
               if (role.roleName.trim() === 'ROLE_PROVIDER') this.isProvider = true;
            });

            console.log('ADMIN: ' + this.isAdmin);

         },

         errorResponse => {
            console.log(errorResponse);
         }

      );
   }


   getUserNetworks():void 
   {
      this.nodeNetworkService.getUserNetworks().subscribe(

         (response:UserNetworks) => {
            // If network response is received then user has a network or more.
            this.userHasNetwork = true;

            // Networks the user joined
            this.userNetworks = response.userNetworks;

            // Select the first network as default
            this.selectedNetwork = this.userNetworks[0];

            // Currently selected network UUID
            this.selectedNetworkUUID = this.selectedNetwork.networkUUID;
         },

         (error:ErrorResponse) => {
            console.log(error);

            // If Http NOT_FOUND status is returned
            if (error.httpStatus === 404) {
               this.userHasNetwork = false;
            }
         }

      );
   }


   generateNetwork(networkName:string):void
   {
      this.nodeNetworkService.generateNetwork(networkName).subscribe(

         response => {
            console.log(response);

            // Update page contents with the newly added network
            this.getUserNetworks();
         },

         error => {
            console.log(error);
         }

      );

      // TODO: Save received GenesisBlock and save network chain to local DB file
   }  


   log(value:any): void 
   {
      console.log(value);
   }


   showNetworkCreationModal(): void 
   {
      this.isNetworkCreationModalVisible = true;
   }


   onNetworkCreationSubmit(): void 
   {
      // Generate network using the network name input value
      this.generateNetwork(this.newNetworkName);

      // Close modal
      this.isNetworkCreationModalVisible = false;
   }

  
   onNetworkCreationCancel(): void 
   {
      this.isNetworkCreationModalVisible = false;
   }


   inviteUser(username:string): void 
   {
      let currentUserUsername = this.authService.getCurrentUser().username;

      let invitationRequest:NetworkInvitationRequest = {
         recipientUsername: username,
         senderUsername: currentUserUsername,
         networkName: this.selectedNetwork.name,
         networkUUID: this.selectedNetwork.networkUUID,
         invitationToken: null // Invitation token is created on server-side
      }

      this.nodeNetworkService.sendNetworkInvitationRequest(invitationRequest).subscribe(

         response => {
            console.log(response);
         },

         error => {
            console.log(error);
         }

      );

   }
}
