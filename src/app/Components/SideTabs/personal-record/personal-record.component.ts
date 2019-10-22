import { MedicalRecordResponse } from './../../../Models/Payload/Responses/MedicalRecordResponse';
import { Component, OnInit } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd';
import { AuthService } from 'src/app/Services/auth.service';
import { UserRecordService } from './../../../Services/user-record.service';
import { InformationInputComponent } from './../../Modals/information-input/information-input.component';
import AppUtil from 'src/app/Helpers/Utils/AppUtil';
import ModelMapper from 'src/app/Helpers/Utils/ModelMapper';


@Component({
   selector: 'app-personal-record',
   templateUrl: './personal-record.component.html',
   styleUrls: ['./personal-record.component.css']
})


export class PersonalRecordComponent implements OnInit
{
   userHasEhr:boolean = false;
   userMedicalRecord:MedicalRecordResponse;
   userAddress:string = "";

   constructor(
      private authService:AuthService, private modalService:NzModalService,
      private userRecordService:UserRecordService
   ) { }

   ngOnInit() { 
      // Check if user has an EHR and has completed info entry
      this.checkUserEhrCreation();
      this.getUserAddress();
      this.getUserRecord();
   }

   private checkUserEhrCreation() {
      // Check for EHR creation updates while logged in
      this.userRecordService.getUserHasEhr().subscribe(userHasEhr => this.userHasEhr = userHasEhr);
      this.userRecordService.getUserEhr().subscribe(userEhr => {
         this.userMedicalRecord = ModelMapper.mapRecordToSerializableMedicalRecord(userEhr);
         this.calculateAge();
      });
      // Check if user has already created their EHR
      if (this.authService.getCurrentUser().hasAddedInfo) { 
         this.userHasEhr = true;
         this.getUserRecord();
      }
   }


   showEhrCreationModal(): void {
      // Create modal
      const userInfoModal = this.modalService.create({
         nzTitle: "Add your personal and medical information",
         nzContent: InformationInputComponent,
         nzWidth: "70%",
         nzFooter: null,
         nzMaskClosable: false
      });
      // delay until modal instance created
      window.setTimeout(() => {
         const instance = userInfoModal.getContentComponent();
      }, 2000);
   }

   getUserRecord() {
      if (this.userHasEhr) {
         this.userRecordService.getCurrentUserRecord().then(
            record => { 
               this.userMedicalRecord = ModelMapper.mapRecordToSerializableMedicalRecord(record);
               console.log(this.userMedicalRecord.history);
               this.calculateAge();
            }, 
            () => AppUtil.createMessage("error", "Error while retrieving your record")
         );
      }
   }

   private calculateAge(): void {
      let birthDateInMs = this.userMedicalRecord.patientInfo.birthDate;
      let currentTimeInMs = new Date().getTime();
      this.userMedicalRecord.patientInfo.birthDate = Math.floor((currentTimeInMs - birthDateInMs) / (1000*60*60*24*30*12));
   }

   getUserAddress() {
      this.userAddress = this.authService.getCurrentUser().address;
   }
}
