import { Block } from './../../../DataAccess/entities/Core/Block';
import { SimpleStringPayload } from './../../../Models/Payload/Responses/SimpleStringPayload';
import { ErrorResponse } from './../../../Models/Payload/Responses/ErrorResponse';
import { BlockResponse } from '../../../Models/Payload/Responses/BlockResponse';
import { UserNetworks } from '../../../Models/Payload/Responses/UserNetworks';
import { NodeNetworkService } from './../../../Services/node-network.service';
import { MainLayoutService } from './../../../Services/main-layout.service';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../Services/auth.service';
import { NetworkInfo } from '../../../Models/Payload/Responses/NetworkInfo';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NodeClustersService } from '../../../Services/node-clusters.service';
import { NetworkInvitationRequest } from '../../../Models/Payload/Requests/NetworkInvitationRequest';
import { DatabaseService } from '../../../DataAccess/database.service';
import ModelMapper from '../../../Helpers/Utils/ModelMapper';
import { NzMessageService } from 'ng-zorro-antd/message';


@Component({
   selector: 'app-network-manager',
   templateUrl: './network-manager.component.html',
   styleUrls: ['./network-manager.component.css']
})


export class NetworkManagerComponent implements OnInit {

   //#region States

   isAdmin: boolean = false;
   isProvider: boolean = false;
   selectedNetwork: any = {};
   userNetworks: NetworkInfo[];
   userHasNetwork: boolean = true;
   newNetworkName: string;
   isNetworkCreationModalVisible: boolean = false;
   invitedUserUsername: string;

   state = {};

   uiState = {
      isLoading: false,
   };

   //#endregion
   

   constructor(
      private networkService: NodeNetworkService, 
      private authService: AuthService,
      public mainLayout: MainLayoutService, 
      private modalService: NzModalService,
      private messageService: NzMessageService,
      private clustersService: NodeClustersService, 
      private databaseService: DatabaseService
   ) { }


   /* -------------------------------------------------------------------------- */
   /*                               Initialization                               */
   /* -------------------------------------------------------------------------- */
   //#region
   
   ngOnInit(): void {
      this.mainLayout.show();
      this.getUserNetworks();
      this.getUserRoles();
   }


   private getUserRoles(): void {
      this.authService.getUserRoles().forEach(role => {
         if (role.trim() === 'ROLE_ADMIN') this.isAdmin = true;
         if (role.trim() === 'ROLE_PROVIDER') this.isProvider = true;
      });
   }


   private getUserNetworks(): void {

      // Display loader
      this.uiState.isLoading = true;

      this.networkService.getUserNetworks().subscribe(

         (response: UserNetworks) => {
            this.userHasNetwork = true;
            this.userNetworks = response.userNetworks;
            this.selectedNetwork = this.userNetworks[0];
            this.uiState.isLoading = false;
         },

         (error: ErrorResponse) => {
            if (error.httpStatus === 404 || error.httpStatus === 403) this.userHasNetwork = false;
            this.uiState.isLoading = false;
         }

      );
   }

   //#endregion


   /* -------------------------------------------------------------------------- */
   /*                               User Interface                               */
   /* -------------------------------------------------------------------------- */
   //#region 

   showNetworkCreationModal(): void {
      this.isNetworkCreationModalVisible = true;
   }


   onNetworkCreationCancel(): void {
      this.isNetworkCreationModalVisible = false;
   }

   //#endregion


   /* -------------------------------------------------------------------------- */
   /*                                API / Submit                                */
   /* -------------------------------------------------------------------------- */
   //#region

   onNetworkCreationSubmit(): void {

      // Generate network using the network name input value
      this.generateNetwork(this.newNetworkName);

      // Close modal
      this.isNetworkCreationModalVisible = false;
   }


   generateNetwork(networkName: string): void {

      this.uiState.isLoading = true;

      this.networkService.generateNetwork(networkName).subscribe(

         (response: BlockResponse) => {
            // Save the received genesis block
            this.saveNetworkGenesisBlock(networkName, response);
            this.clustersService.resetClustersSubscription();
            this.messageService.success('Network Created Succssfully');
            this.getUserNetworks();
         },

         (error: ErrorResponse) => {
            console.log(error);
            this.messageService.error('Error Creating Network');
            this.uiState.isLoading = false;
         }

      );

   }


   private saveNetworkGenesisBlock(networkName: string, genesisBlock: BlockResponse): void {

      console.log('[NetworkManager Component] Generating Genesis Block');

      // Get network UUID of network with network name of the recently created network
      this.networkService.getNetworkUuidByName(networkName).subscribe(

         async (response: SimpleStringPayload) => {
            // UUID response
            let networkUUID = response.payload;

            // Create a DB connection for the recently added network
            await this.databaseService.createNetworkDbConnection(networkUUID);

            // Get a Block from the response genesis block
            let block: Block = ModelMapper.mapBlockResponseToBlock(genesisBlock);
            block.senderPubKey = "";

            console.log('[NetworkManager Component] Genesis Block', block);

            // Get DB connection for the network, then save the block
            await this.databaseService.getNetworkDbConnection(networkUUID).getRepository(Block).save(block);

            // Update networks with the newly added network
            this.getUserNetworks();
         },

         (error: ErrorResponse) => {
            console.log(error);
         }

      );

   }


   inviteUser(username: string): void {

      let currentUserUsername = this.authService.getCurrentUser().username;

      let invitationRequest: NetworkInvitationRequest = {
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

   //#endregion

}
