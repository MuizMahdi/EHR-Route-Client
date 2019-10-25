import { NodeClustersService } from './../../../Services/node-clusters.service';
import { ErrorResponse } from './../../../Models/Payload/Responses/ErrorResponse';
import { ProviderService } from './../../../Services/provider.service';
import { ChainService } from './../../../Services/chain.service';
import { Component, OnInit, Input } from '@angular/core';
import { Notification } from 'src/app/Models/Payload/Responses/Notification';
import { NzModalRef } from 'ng-zorro-antd';
import { NetworkInvitationRequest } from 'src/app/Models/Payload/Requests/NetworkInvitationRequest';
import { NotificationService } from 'src/app/Services/notification.service';
import { NodeNetworkService } from 'src/app/Services/node-network.service';
import AppUtil from 'src/app/Helpers/Utils/AppUtil';


@Component({
   selector: 'app-network-invitation',
   templateUrl: './network-invitation.component.html',
   styleUrls: ['./network-invitation.component.css']
})


export class NetworkInvitationComponent implements OnInit 
{
   @Input() notification: Notification;
   invitationRequest:NetworkInvitationRequest;


   constructor(
      private modal:NzModalRef, private notificationService:NotificationService, 
      private clusterService:NodeClustersService, private networkService:NodeNetworkService,
      private chainService:ChainService, private providerService:ProviderService
   ) 
   { }


   ngOnInit() {
      if (this.notification) {
         this.invitationRequest = this.notification.reference;
      }
   }


   onInvitationAccept(): void {
      if (this.notification) {
         this.invitationAccept(this.invitationRequest);
      }
      this.modal.destroy();
   }
   

   invitationAccept(invitationRequest:NetworkInvitationRequest): void {
      this.networkService.networkInvitationAccept(invitationRequest).subscribe(
         response => {
            this.getNetworkChain(invitationRequest.networkUUID);
            this.deleteNotification();
            this.clusterService.resetClustersSubscription();
            AppUtil.createMessage("success", "You have joined a new network");
            console.log(response);
         },
         (error:ErrorResponse) => { AppUtil.createMessage("error", error.message) }
      );   
   }


   private getNetworkChain(networkUUID:string) {
      let nodeUUID:string = localStorage.getItem('providerUUID');

      console.log("Fetching network chain");

      this.chainService.getNetworkChain(nodeUUID, networkUUID, 1, 0).subscribe(
         response => { console.log(response) },
         (error:ErrorResponse) => { console.log(error) }
      )
   }


   private deleteNotification(): void {
      console.log("Deleting notification");
      this.notificationService.deleteNotification(this.notification.notificationID).subscribe( 
         response => { console.log(response) },
         error => { console.log(error) }
      );
   }
}
