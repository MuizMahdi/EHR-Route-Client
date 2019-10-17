import { Component, OnInit } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd';
import { AuthService } from 'src/app/Services/auth.service';
import { UserRecordService } from './../../../Services/user-record.service';
import { InformationInputComponent } from './../../Modals/information-input/information-input.component';
import AppUtil from 'src/app/Helpers/Utils/AppUtil';


@Component({
   selector: 'app-personal-record',
   templateUrl: './personal-record.component.html',
   styleUrls: ['./personal-record.component.css']
})


export class PersonalRecordComponent implements OnInit
{
   userHasEhr:boolean = false;
   userMedicalRecord:any;

   constructor(
      private authService:AuthService, private modalService:NzModalService,
      private userRecordService:UserRecordService
   ) { }

   ngOnInit() { 
      // Check if user has an EHR and has completed info entry
      this.checkUserEhrCreation();
   }

   private checkUserEhrCreation() {
      // Check if user has already created their EHR
      if (this.authService.getCurrentUser().hasAddedInfo) { 
         this.userHasEhr = true;
         this.getUserRecord();
      }
   }


   showUserInfoModal(): void {
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
            record => this.userMedicalRecord = record, 
            () => AppUtil.createMessage("error", "Error while retrieving your record")
         );

         console.log(this.userMedicalRecord);
      }
   }
}
