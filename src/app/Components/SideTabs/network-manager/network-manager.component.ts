import { Block } from './../../../DataAccess/entities/Core/Block';
import { SimpleStringPayload } from './../../../Models/Payload/Responses/SimpleStringPayload';
import { ErrorResponse } from './../../../Models/Payload/Responses/ErrorResponse';
import { BlockResponse } from '../../../Models/Payload/Responses/BlockResponse';
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
import AppUtil from 'src/app/Helpers/Utils/AppUtil';


@Component({
   selector: 'app-network-manager',
   templateUrl: './network-manager.component.html',
   styleUrls: ['./network-manager.component.css']
})


export class NetworkManagerComponent implements OnInit 
{
   selectedNetwork:any = {};
   userNetworks:NetworkInfo[];
   userHasNetwork:boolean = true;

   newNetworkName:string;
   isNetworkCreationModalVisible:boolean = false;

   invitedUserAddress:string;


   constructor(
      private networkService:NodeNetworkService, private authService:AuthService, 
      public mainLayout:MainLayoutService, private modalService:NzModalService,
      private clustersService:NodeClustersService, private databaseService:DatabaseService
   ) { }

   async ngOnInit() {
      console.log("{NetworkManager} OnInit: Inside network manager component");
      this.mainLayout.show();
      this.updateNetworks();
   }


   generateNetwork(networkName:string):void {
      this.networkService.generateNetwork(networkName).subscribe(
         async (response:BlockResponse) => {
            // Save the received genesis block
            await this.saveNetworkGenesisBlock(networkName, response);
            this.clustersService.resetClustersSubscription();
         },
         (error:ErrorResponse) => AppUtil.createMessage("error", error.message)
      );
   }


   private async saveNetworkGenesisBlock(networkName:string, genesisBlock:BlockResponse) {
      // Get network UUID of network with network name of the recently created network
      await this.networkService.getNetworkUuidByName(networkName).subscribe(

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
         (error:ErrorResponse) => AppUtil.createMessage("error", error.message)
      );

   }


   private updateNetworks(): void {
      console.log("{NetworkManager} Getting user networks");
      this.networkService.getUserNetworks().subscribe(
         (response:UserNetworks) => {
            console.log("{NetworkManager} User networks retreived");
            this.userHasNetwork = true;
            this.userNetworks = response.userNetworks;
            this.selectedNetwork = this.userNetworks[0];
         },
         (error:ErrorResponse) => {
            if (error.httpStatus === 404) {
               console.log("{NetworkManager} User has no networks");
               this.userHasNetwork = false;
               AppUtil.createMessage("error", "You are not a memeber of any network");
            }
            console.log(error);
         }
      );
   }


   showNetworkCreationModal(): void {
      this.isNetworkCreationModalVisible = true;
   }


   onNetworkCreationSubmit(): void {
      // Generate network using the network name input value
      this.generateNetwork(this.newNetworkName);
      // Close modal
      this.isNetworkCreationModalVisible = false;
   }

  
   onNetworkCreationCancel(): void {
      this.isNetworkCreationModalVisible = false;
   }


   inviteUser(address:string): void {
      let currentUserAddress = this.authService.getCurrentUser().address;

      let invitationRequest:NetworkInvitationRequest = {
         recipientAddress: address,
         senderAddress: currentUserAddress,
         networkName: this.selectedNetwork.name,
         networkUUID: this.selectedNetwork.networkUUID,
         invitationToken: null // Invitation token is created on server-side
      }

      this.networkService.sendNetworkInvitationRequest(invitationRequest).subscribe(
         () => AppUtil.createMessage("success", "Network Invitation Request Sent Successfully"),
         (error:ErrorResponse) => AppUtil.createMessage("error", error.message)
      );
   }
}
