import { MedicalRecord } from './../../../DataAccess/entities/EHR/MedicalRecord';
import { UserRecordService } from './../../../Services/user-record.service';
import { MedicalRecordResponse } from './../../../Models/Payload/Responses/MedicalRecordResponse';
import { TransactionService } from './../../../Services/transaction.service';
import { UserConsentResponse } from './../../../Models/Payload/Requests/UserConsentResponse';
import { PatientInfo } from './../../../Models/Payload/Requests/PatientInfo';
import { EhrPatientInfo } from './../../../DataAccess/entities/EHR/EhrPatientInfo';
import { PatientInfoService } from './../../../Services/patient-info.service';
import { AuthService } from 'src/app/Services/auth.service';
import { AddressService } from './../../../Services/address.service';
import { Address } from './../../../DataAccess/entities/Core/Address';
import { ErrorResponse } from 'src/app/Models/Payload/Responses/ErrorResponse';
import { NetworkDetails } from './../../../Models/Payload/Responses/NetworkDetails';
import { NodeNetworkService } from './../../../Services/node-network.service';
import { NotificationService } from './../../../Services/notification.service';
import { Notification } from 'src/app/Models/Payload/Responses/Notification';
import { NzModalRef, NzModalService } from 'ng-zorro-antd';
import { ConsentRequest } from './../../../Models/Payload/Responses/ConsentRequest';
import { Component, OnInit, Input } from '@angular/core';
import ModelMapper from 'src/app/Helpers/Utils/ModelMapper';


@Component({
  selector: 'app-consent-request',
  templateUrl: './consent-request.component.html',
  styleUrls: ['./consent-request.component.css']
})


export class ConsentRequestComponent implements OnInit 
{

   @Input() notification: Notification;
   consentRequest: ConsentRequest;
   requesterNetworkDetails: NetworkDetails;


   constructor(
      private notificationService:NotificationService, private modal:NzModalRef,
      private networkService:NodeNetworkService, private addressService:AddressService,
      private patientInfoService:PatientInfoService, private authService:AuthService,
      private transactionService:TransactionService, private modalService: NzModalService,
      private recordService:UserRecordService
   ) 
   { }


   ngOnInit() {
      if (this.notification) {
         this.consentRequest = this.notification.reference;
         this.getRequesterNetworkDetails(this.consentRequest.networkUUID);
      }
   }


   getRequesterNetworkDetails(networkUUID:string): void
   {
      this.networkService.getNetworkDetails(networkUUID).subscribe(

         (response:NetworkDetails) => {
            this.requesterNetworkDetails = response;
         },

         (error:ErrorResponse) => {
            console.log(error);
         }

      );
   }


   async onConsentRequestAccept() {

      // Get current user ID
      let userID: number = this.authService.getCurrentUser().id

      // Get user's address (also private key) from DB
      let userAddress:Address = await this.addressService.getUserAddress(userID);

      // Get user's medical record from DB
      let userMedicalRecord:MedicalRecord = await this.recordService.getUserRecord(userID);

      // Add user's medical record into the Block in the ConsentRequest
      if (this.consentRequest) {
         let medicalRecord:MedicalRecordResponse = ModelMapper.mapRecordToRecordResponse(userMedicalRecord);

         // TODO: //////////////////////////////////////////////////////////////////////////////////////////
            // TODO: FrEaKiNg sErILiZatIoN iSSUe /////////////////////////////////////////////////////////////
               medicalRecord.history = null; ///////////////////////////////////////////////////////////////////
            // TODO: FrEaKiNg sErILiZatIoN iSSUe /////////////////////////////////////////////////////////////
         // TODO: //////////////////////////////////////////////////////////////////////////////////////////

         this.consentRequest.block.transaction.record = medicalRecord;
      }

      // Construct a UserConsentResponse object
      let userConsentResponse:UserConsentResponse = {
         block: this.consentRequest.block,
         userPrivateKey: userAddress.privateKey,
         userAddress: userAddress.address,
         consentRequestUUID: this.consentRequest.consentRequestUUID,
         providerUUID: this.consentRequest.providerUUID,
         networkUUID: this.consentRequest.networkUUID,
         userID: userID
      }

      // Send the consent response
      this.transactionService.sendUserEhrConsentResponse(userConsentResponse).subscribe(

         response => {
            console.log(response);
            // Delete notification
            this.deleteNotification();
         },

         error => {
            console.log(error);
         }

      );

   }


   onConsentRequestReject()
   {
      // View a modal asking for confirmation
      this.modalService.confirm({
         nzTitle: 'Are you sure that you want to reject ?',
         nzContent: 'The institution will not be notified if you reject the request',
         nzOnOk: () => { this.deleteNotification(); this.modal.close(); }
      });
   }


   deleteNotification(): void
   {
      this.notificationService.deleteNotification(this.notification.notificationID).subscribe( 

         response => {
            console.log(response);
         },

         error => {
            console.log(error);
         }

      );
   }
}
