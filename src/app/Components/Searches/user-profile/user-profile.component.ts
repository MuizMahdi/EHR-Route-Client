import { TransactionService } from './../../../Services/transaction.service';
import { AuthService } from 'src/app/Services/auth.service';
import { AddressService } from './../../../Services/address.service';
import { ChainService } from './../../../Services/chain.service';
import { ProviderService } from './../../../Services/provider.service';
import { UserNetworks } from './../../../Models/Payload/Responses/UserNetworks';
import { NodeNetworkService } from './../../../Services/node-network.service';
import { NzModalService, NzModalRef } from 'ng-zorro-antd';
import { ErrorResponse } from 'src/app/Models/Payload/Responses/ErrorResponse';
import { UserInfo } from './../../../Models/Payload/Responses/UserInfo';
import { UsersService } from './../../../Services/users.service';
import { Component, OnInit, Input, TemplateRef } from '@angular/core';
import { NetworkInfo } from 'src/app/Models/Payload/Responses/NetworkInfo';
import AppUtil from 'src/app/Helpers/Utils/AppUtil';


@Component({
   selector: 'app-user-profile',
   templateUrl: './user-profile.component.html',
   styleUrls: ['./user-profile.component.css']
})


export class UserProfileComponent implements OnInit
{
   // Searched username
   @Input() searchParameter: string;
   searchedUser:UserInfo = null;
   selectedNetwork:any = {};
   userNetworks:NetworkInfo[];
   userHasNetwork:boolean = false;
   networkSelectionModal: NzModalRef;


   constructor(
      private userService:UsersService, private modalService:NzModalService, 
      private networkService:NodeNetworkService, private chainService:ChainService, 
      private authService:AuthService, private transactionService:TransactionService
   ) { }


   ngOnInit() {
      this.getSearchedUserProfile();
      this.getCurrentUserNetworks();
   }


   private getSearchedUserProfile(): void {
      if (this.searchParameter) {
         // Get user profile
         this.userService.getUserInfo(this.searchParameter).subscribe(

            (response:UserInfo) => {
               this.searchedUser = response;
            },

            (error:ErrorResponse) => {
               console.log(error);
            }

         );
      }
   }


   private getCurrentUserNetworks(): void {
      this.networkService.getUserNetworks().subscribe(

         (response:UserNetworks) => {
            // If network response is received then user has a network.
            this.userHasNetwork = true;

            // Get user networks from response
            this.userNetworks = response.userNetworks;

            // Select the first network as default selected network for the network selector
            this.selectedNetwork = this.userNetworks[0];
         },
         (error:ErrorResponse) => {
            // Http NOT_FOUND status is returned when user has no networks
            if (error.httpStatus === 404) {
               this.userHasNetwork = false;
            }
         }

      );
   }


   async requestEhrPrivilege() {
      let providerUserId = this.authService.getCurrentUser().id;
      let patientUserId = this.searchedUser.id;
      let providerNetworkUUID = this.selectedNetwork.networkUUID;
      let blockAdditionRequest = await this.chainService.generateBlockAdditionRequest(providerUserId, patientUserId, providerNetworkUUID);
   
      this.transactionService.sendUserEhrConsentRequest(blockAdditionRequest).subscribe(
         response => { AppUtil.createMessage("success", "EHR Acquisition Consent Request Was Sent") },
         (error:ErrorResponse) => { console.log(error) }
      );
   }


   createNetworkSelectionModal(templateContent: TemplateRef<{}>): void {
      this.networkSelectionModal = this.modalService.create({
         nzTitle: "Network Selection",
         nzContent: templateContent,
         nzOnOk: () => this.requestEhrPrivilege(),
         nzOkText: 'Request EHR'
      });
   }


   destroyNetworkSelectionModal(): void {
      this.networkSelectionModal.destroy();
   }
}
