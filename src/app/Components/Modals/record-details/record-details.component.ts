import { EhrHistory } from './../../../DataAccess/entities/EHR/EhrHistory';
import { EhrAllergyAndReaction } from './../../../DataAccess/entities/EHR/EhrAllergyAndReaction';
import { EhrCondition } from './../../../DataAccess/entities/EHR/EhrCondition';
import { TransactionService } from './../../../Services/transaction.service';
import { UpdatedBlockAdditionRequest } from './../../../Models/Payload/Requests/UpdatedBlockAdditionRequest';
import { RecordUpdateData } from './../../../Models/Payload/Requests/RecordUpdateData';
import { AuthService } from './../../../Services/auth.service';
import { BlockAdditionRequest } from './../../../Models/Payload/Requests/BlockAdditionRequest';
import { ChainService } from './../../../Services/chain.service';
import { BlockInfo } from './../../../Models/App/BlockInfo';
import { HealthRecordData } from './../../../Models/App/HealthRecordData';
import { ElectronicHealthRecord } from './../../../Models/App/ElectronicHealthRecord';
import { NzModalService } from 'ng-zorro-antd';
import { Component, OnInit, Input } from '@angular/core';
import AppUtil from 'src/app/Helpers/Utils/AppUtil';


@Component({
  selector: 'app-record-details',
  templateUrl: './record-details.component.html',
  styleUrls: ['./record-details.component.css']
})


export class RecordDetailsComponent implements OnInit
{
   @Input() EHR: ElectronicHealthRecord;

   patientAge:number;

   recordData: HealthRecordData;
   blockInfo: BlockInfo;

   ehrConditions: string[] = [];
   ehrAllergies: string[] = [];
   ehrHistory: any[] = [];

   toggleViewedDetails: boolean = true;
   isEditingEhr: boolean = false;

   constructor(
      private modalService:NzModalService, private chainService:ChainService,
      private authService:AuthService, private transactionService:TransactionService
   ) { }


   ngOnInit() {
      if (this.EHR) {
         this.recordData = this.EHR.recordData;
         this.blockInfo = this.EHR.blockInfo;
         this.initEhrDataArrays();
         this.calculateAge();
      }
   }


   private initEhrDataArrays() {
      let conditions: EhrCondition[] = this.recordData.conditions;
      let allergies: EhrAllergyAndReaction[] = this.recordData.allergies;
      let history: EhrHistory[] = this.recordData.history;

      conditions.forEach((ehrCondition:EhrCondition) => {
         this.ehrConditions.push(ehrCondition.condition);
      });

      allergies.forEach((ehrAllergy:EhrAllergyAndReaction) => {
         this.ehrAllergies.push(ehrAllergy.allergy);
      });

      history.forEach((ehrHistory) => {
         this.ehrHistory.push({condition: ehrHistory.condition, occurrence: ehrHistory.occurrence});
      });
   }


   private calculateAge(): void {
      let birthDateInMs = this.EHR.recordData.patientData.birthDate;
      let currentTimeInMs = new Date().getTime();
      this.patientAge = Math.floor((currentTimeInMs - birthDateInMs) / (1000*60*60*24*30*12));
   }


   toggleRecordDetails(): void {
      this.toggleViewedDetails = !this.toggleViewedDetails;
   }


   addCondition(condition:string): void {
      this.ehrConditions.push(condition);
   }


   deleteCondition(condition:string): void {

      let conditionIndex = this.ehrConditions.indexOf(condition);

      if (conditionIndex > -1) {
         this.ehrConditions.splice(conditionIndex, 1);
      }

   }


   addAllergy(allergy:string): void {
      this.ehrAllergies.push(allergy);
   }


   deleteAllergy(allergy:string): void {

      let allergyIndex = this.ehrAllergies.indexOf(allergy);

      if (allergyIndex > -1) {
         this.ehrAllergies.splice(allergyIndex, 1);
      }

   }


   toggleEhrEditing(): void {
      this.isEditingEhr = !this.isEditingEhr;
   }


   async requestEhrUpdateConsent() {

      let providerUserId = this.authService.getCurrentUser().id;
      let patientUserId = this.recordData.patientData.userID;
      let providerNetworkUUID = this.blockInfo.networkUUID;

      // Generate a block addition request
      let blockAddition: BlockAdditionRequest = await this.chainService.generateBlockAdditionRequest(providerUserId, patientUserId, providerNetworkUUID);

      // Get the updated/edited EHR data
      let recordUpdateData:RecordUpdateData = {
         conditions: this.ehrConditions,
         allergies: this.ehrAllergies,
         history: this.ehrHistory
      }

      // Construct an UpdatedBlockAdditionRequest
      let updatedBlockRequest:UpdatedBlockAdditionRequest = {
         blockAddition,
         recordUpdateData
      }

      this.transactionService.sendEhrUpdateConsentRequest(updatedBlockRequest).subscribe(
         response => { AppUtil.createMessage("success", "EHR Update Consent Was Sent") },
         error => { console.log(error) }
      );

      console.log(updatedBlockRequest);
   }
}
