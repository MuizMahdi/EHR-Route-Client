import { Block } from './../../../DataAccess/entities/Core/Block';
import { SimpleStringPayload } from './../../../Models/Payload/Responses/SimpleStringPayload';
import { ErrorResponse } from './../../../Models/Payload/Responses/ErrorResponse';
import { BlockResponse } from './../../../Models/Payload/Responses/BlockResponse';
import { UserNetworks } from '../../../Models/Payload/Responses/UserNetworks';
import { NodeNetworkService } from './../../../Services/node-network.service';
import { UserRole } from '../../../Models/Payload/Responses/UserRole';
import { MainLayoutService } from './../../../Services/main-layout.service';
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/Services/auth.service';
import { NetworkInfo } from 'src/app/Models/Payload/Responses/NetworkInfo';
import { NzModalService } from 'ng-zorro-antd';
import { NodeClustersService } from 'src/app/Services/node-clusters.service';
import { NetworkInvitationRequest } from 'src/app/Models/Payload/Requests/NetworkInvitationRequest';
import { DatabaseService } from 'src/app/DataAccess/database.service';
import ModelMapper from 'src/app/Helpers/Utils/ModelMapper';


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
   userNetworks:NetworkInfo[];
   userHasNetwork:boolean = true;

   newNetworkName:string;
   isNetworkCreationModalVisible:boolean = false;

   invitedUserUsername:string;


   constructor(
      private networkService:NodeNetworkService, private authService:AuthService, 
      public mainLayout:MainLayoutService, private modalService:NzModalService,
      private clustersService:NodeClustersService, private databaseService:DatabaseService
   ) { }


   async ngOnInit() 
   {
      this.mainLayout.show();
      this.updateNetworks();
      this.initUserRole();
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


   generateNetwork(networkName:string):void
   {

      this.networkService.generateNetwork(networkName).subscribe(

         (response:BlockResponse) => {
            // Save the received genesis block
            this.saveNetworkGenesisBlock(networkName, response);
         },

         (error:ErrorResponse) => {
            console.log(error);
         }

      );

   }


   private saveNetworkGenesisBlock(networkName:string, genesisBlock:BlockResponse): void
   {
      // Get network UUID of network with network name of the recently created network
      this.networkService.getNetworkUuidByName(networkName).subscribe(

         async (response:SimpleStringPayload) => {
            // UUID response
            let networkUUID = response.payload;

            // Create a DB connection for the recently added network
            await this.databaseService.createNetworkDbConnection(networkUUID);

            // Get a Block from the response genesis block
            let block:Block = ModelMapper.mapBlockResponseToBlock(genesisBlock);

            // Get DB connection for the network, then save the block
            await this.databaseService.getNetworkDbConnection(networkUUID).getRepository(Block).save(block);

            // Update networks with the newly added network
            this.updateNetworks();
         },

         (error:ErrorResponse) => {
            console.log(error);
         }

      );

   }


   private updateNetworks(): void
   {
      this.networkService.getUserNetworks().subscribe(

         (response:UserNetworks) => {
            this.userHasNetwork = true;
            this.userNetworks = response.userNetworks;
            this.selectedNetwork = this.userNetworks[0];
         },

         (error:ErrorResponse) => {
            if (error.httpStatus === 404) {
               this.userHasNetwork = false;
            }
         }

      );
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

      this.networkService.sendNetworkInvitationRequest(invitationRequest).subscribe(

         response => {
            console.log(response);
         },

         error => {
            console.log(error);
         }

      );

   }
}
