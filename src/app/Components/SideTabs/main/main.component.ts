import { UserRecordService } from '../../../Services/user-record.service';
import { RoleName } from './../../../Models/RoleName';
import { InformationInputComponent } from './../../Modals/information-input/information-input.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { UserInfo } from './../../../Models/Payload/Responses/UserInfo';
import { AuthService } from '../../../Services/auth.service';
import { AddressService } from './../../../Services/address.service';
import { Component, OnInit } from '@angular/core';
import { NodeNetworkService } from '../../../Services/node-network.service';
import { MainLayoutService } from './../../../Services/main-layout.service';
import { NodeClustersService } from '../../../Services/node-clusters.service';


@Component({
   selector: 'app-main',
   templateUrl: './main.component.html',
   styleUrls: ['./main.component.css']
})


export class MainComponent implements OnInit
{
   
   constructor(
      public mainLayout:MainLayoutService, 
      private clustersService:NodeClustersService,
      private networkService:NodeNetworkService, 
      private addressService:AddressService,
      private modalService:NzModalService, 
      private userRecordService:UserRecordService,
      private authService:AuthService
   ) { }


   ngOnInit() {
      // Handles when user reloads page after loggin in, to show a prompt, which 
      // allows for a request to be made, unsubscribing the node from clusters.
      //this.handleReloads();
      this.mainLayout.show();
      this.checkUserRole();
   }


   handleReloads(): void {

      var showMsgTimer;
      var clusterService = this.clustersService;

      // Before user refreshes page, show a prompt asking for confirmation
      window.onbeforeunload = function(evt) {       
         
         // Unsubscribe from clusters and close SSE http connections (EventSource connections)
         clusterService.unsubscribeClusters();

         showMsgTimer = window.setTimeout(showMessage, 500);
 
         evt.returnValue = '';
     
         return '';

      }
     
      window.onunload = function () {
         clearTimeout(showMsgTimer);
      }

      // If user decides to stay on page
      function showMessage() {
         // Subscribe to clusters again
         clusterService.subscribeClusters();
      }

   }


   private initializeProviderLocalDbs(userID:number): void {

      // Establish connection to user's address DB
      this.addressService.ensureAddressDbConnection(userID);

      // Establish connections to all of user's networks DBs if they exist
      this.networkService.checkUserNetworks();

   }


   private initializeUserLocalDbs(userID:number): void {

      // Establish connection to user's address DB
      this.addressService.ensureAddressDbConnection(userID);

      // Establish connection to user's medical record DB
      this.userRecordService.ensureUserRecordDbConnection(userID);

   }


   private checkUserRole(): void {

      // Get user info once received from server
      this.authService.currentUser.subscribe((userInfo:UserInfo) => {

         let isProvider: boolean = false;

         // If user is logged in and user info received
         if (userInfo) {

            // Check if user is provider
            userInfo.roles.forEach(role => { if (role === RoleName.PROVIDER || role === RoleName.ADMIN) isProvider = true; });

            if (isProvider) this.initializeProviderLocalDbs(userInfo.id); 
            else {
               // Check if they have added and saved their info
               this.checkIfHasAddedInfo(userInfo);
               this.initializeUserLocalDbs(userInfo.id);
            }

         }

      });

   }


   private checkIfHasAddedInfo(userInfo:UserInfo): void {
      if (userInfo && !(userInfo.hasAddedInfo)) this.showUserInfoModal();
   }


   private showUserInfoModal(): void {

      console.info('[MainComponent] Displaying info addition modal...');

      this.modalService.create({
         nzTitle: "Medical Record Information",
         nzContent: InformationInputComponent,
         nzWidth: "70%",
         nzFooter: null,
         nzClosable: false,
         nzMaskClosable: false,
         nzKeyboard: false
      });
      
   }

}
