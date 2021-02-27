import { MedicalRecordUpdates } from '../../../Models/Payload/Responses/MedicalRecordUpdates';
import { MedicalRecordResponse } from './../../../Models/Payload/Responses/MedicalRecordResponse';
import { UserRecordService } from './../../../Services/user-record.service';
import { MedicalRecord } from './../../../DataAccess/entities/EHR/MedicalRecord';
import { TransactionService } from './../../../Services/transaction.service';
import { UserUpdateConsentResponse } from './../../../Models/Payload/Responses/UserUpdateConsentResponse';
import { UserConsentResponse } from './../../../Models/Payload/Requests/UserConsentResponse';
import { PatientInfo } from './../../../Models/Payload/Requests/PatientInfo';
import { ConsentRequest } from './../../../Models/Payload/Responses/ConsentRequest';
import { PatientInfoService } from './../../../Services/patient-info.service';
import { EhrPatientInfo } from './../../../DataAccess/entities/EHR/EhrPatientInfo';
import { Address } from './../../../DataAccess/entities/Core/Address';
import { AddressService } from './../../../Services/address.service';
import { AuthService } from './../../../Services/auth.service';
import { ErrorResponse } from './../../../Models/Payload/Responses/ErrorResponse';
import { NetworkDetails } from './../../../Models/Payload/Responses/NetworkDetails';
import { NodeNetworkService } from '../../../Services/node-network.service';
import { NzModalService, NzModalRef } from 'ng-zorro-antd/modal';
import { Notification } from './../../../Models/Payload/Responses/Notification';
import { NotificationService } from './../../../Services/notification.service';
import { UpdateConsentRequest } from './../../../Models/Payload/Responses/UpdateConsentRequest';
import { Component, OnInit, Input } from '@angular/core';
import ModelMapper from '../../../Helpers/Utils/ModelMapper';


@Component({
   selector: 'app-update-consent-request',
   templateUrl: './update-consent-request.component.html',
   styleUrls: ['./update-consent-request.component.css']
})


export class UpdateConsentRequestComponent implements OnInit 
{
   @Input() notification: Notification;
   updateConsentRequest: UpdateConsentRequest;
   requesterNetworkDetails: NetworkDetails;
   
   ehrConditions: string[] = [];
   ehrAllergies: string[] = [];
   ehrHistory: {condition:string; occurrence:boolean;};


   constructor(
      private notificationService: NotificationService, private modalService: NzModalService,
      private networkService :NodeNetworkService, private recordService: UserRecordService,
      private authService: AuthService, private addressService: AddressService,
      private transactionService: TransactionService, private modal: NzModalRef,
   ) { }


   ngOnInit() {
      if (this.notification) {
         this.updateConsentRequest = this.notification.reference;
         this.getRequesterNetworkDetails(this.updateConsentRequest.userConsentRequest.networkUUID);
         this.ehrConditions = this.updateConsentRequest.updateMedicalRecord.problems;
         this.ehrAllergies = this.updateConsentRequest.updateMedicalRecord.allergiesAndReactions;
         this.ehrHistory = this.updateConsentRequest.updateMedicalRecord.history;
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


   async getUpdateConsentResponse(): Promise<UserUpdateConsentResponse>
   {
      // Get current user ID
      let userID: number = this.authService.getCurrentUser().id

      // Get user's address (also private key) from DB
      let userAddress:Address = await this.addressService.getUserAddress(userID);

      // Get user's medical record from DB
      let userMedicalRecord:MedicalRecord = await this.recordService.getUserRecord(userID);

      // Get consent request from UpdateConsentRequest
      let consentRequest:ConsentRequest = this.updateConsentRequest.userConsentRequest;

      // Add user info into the Block in the ConsentRequest
      if (consentRequest) {
         let medicalRecord:MedicalRecordResponse = ModelMapper.mapRecordToRecordResponse(userMedicalRecord);

         // TODO: /////////////////////////////////////////////////////////////////////////////////////////
         // Eliminate the medical history field of the record until the serialization issue is solved
            medicalRecord.history = null;
         // TODO: /////////////////////////////////////////////////////////////////////////////////////////

         consentRequest.block.transaction.record = medicalRecord;
      }

      // Construct a UserConsentResponse object
      let userConsentResponse: UserConsentResponse = {
         block: consentRequest.block,
         medicalHistory: ModelMapper.mapEhrHistoryToHistoryList(userMedicalRecord.history),
         userPrivateKey: userAddress.privateKey,
         userAddress: userAddress.address,
         consentRequestUUID: consentRequest.consentRequestUUID,
         providerUUID: consentRequest.providerUUID,
         networkUUID: consentRequest.networkUUID,
         userID: userID
      }

      // Construct a UserUpdateConsentResponse object
      let updateConsentResponse: UserUpdateConsentResponse = {
         ehrDetailsUuid: this.updateConsentRequest.ehrDetailsUuid,
         consentResponse: userConsentResponse
      }

      return updateConsentResponse;
   }


   async onConsentRequestAccept() {

      // Get the proposed updates
      let updates:MedicalRecordUpdates = this.notification.reference.updateMedicalRecord;

      // Save the updates on the user's local MedicalRecord
      await this.recordService.updateUserRecord(updates);

      // Construct the consent response
      let updateConsentResponse:UserUpdateConsentResponse = await this.getUpdateConsentResponse();

      // Send the consent response
      this.transactionService.sendUpdateEhrConsentResponse(updateConsentResponse).subscribe(

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


   onConsentRequestReject() {
      // View a modal asking for confirmation
      this.modalService.confirm({
         nzTitle: 'Are you sure that you want to reject ?',
         nzContent: 'The institution will not be notified if you reject the request',
         nzOnOk: () => { this.deleteNotification(); this.modal.close(); }
      });
   }


   deleteNotification(): void {
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
