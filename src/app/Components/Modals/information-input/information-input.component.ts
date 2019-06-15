import { EhrHistory } from './../../../DataAccess/entities/EHR/EhrHistory';
import { EhrAllergyAndReaction } from './../../../DataAccess/entities/EHR/EhrAllergyAndReaction';
import { MedicalRecord } from './../../../DataAccess/entities/EHR/MedicalRecord';
import { DbConnectionType } from './../../../Models/DbConnectionType';
import { UserRecordService } from './../../../Services/user-record.service';
import { PatientInfoService } from './../../../Services/patient-info.service';
import { UsersService } from './../../../Services/users.service';
import { NzModalRef } from 'ng-zorro-antd';
import ModelMapper from 'src/app/Helpers/Utils/ModelMapper';
import { DatabaseService } from 'src/app/DataAccess/database.service';
import { AuthService } from './../../../Services/auth.service';
import { CountryResponse } from './../../../Models/Payload/Responses/CountryResponse';
import { LocationService } from './../../../Services/location.service';
import { PatientInfo } from './../../../Models/Payload/Requests/PatientInfo';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { EhrPatientInfo } from 'src/app/DataAccess/entities/EHR/EhrPatientInfo';


@Component({
   selector: 'app-information-input',
   templateUrl: './information-input.component.html',
   styleUrls: ['./information-input.component.css']
})


export class InformationInputComponent implements OnInit 
{
   userInfoForm: FormGroup;

   selectedGender:string = 'male';
   dateFormat:string = 'yyyy/MM/dd';
   countries:CountryResponse[];
   countryCities:any;
   countryInputValue: string;

   allergies: string[] = [];
   medicalHistory: {condition:string; occurrence:boolean;}[] = [];

   isUserInfoModalLoading:boolean = false;


   constructor(
      private locationService:LocationService, private authSerice:AuthService,
      private databaseService:DatabaseService, private modal:NzModalRef, 
      private userService:UsersService, private patientInfoService:PatientInfoService,
      private recordService:UserRecordService
   ) { }


   ngOnInit() {
      this.buildForm();
      this.getCountries();
   }


   private buildForm(): void {
      this.userInfoForm = new FormGroup({
         nameCtrl: new FormControl(null, [Validators.required]),
         birthCtrl: new FormControl(null, [Validators.required]), // Intended
         genderSelectCtrl: new FormControl(null, [Validators.required]),
         phoneCtrl: new FormControl(null, [Validators.required]),
         countryCtrl: new FormControl(null, [Validators.required]),
         cityCtrl: new FormControl(null, [Validators.required]),
         addressCtrl: new FormControl(null, [Validators.required])
      });
   }


   private getCountries(): void {
      this.locationService.getCountries().subscribe(countriesData => {
         this.countries = countriesData['_links']['country:items'];
      });
   }


   onCountrySelect(country:CountryResponse): void {
      // Get the country's cities
      this.locationService.getCities(country.name).subscribe(citiesData => {
         this.countryCities = citiesData['_embedded']['city:search-results'];
      });
   }


   addAllergy(allergy:string): void {
      this.allergies.push(allergy);
   }


   deleteAllergy(allergy:string): void {
      let allergyIndex = this.allergies.indexOf(allergy);

      if (allergyIndex > -1) {
         this.allergies.splice(allergyIndex, 1);
      }
   }


   addMedicalHistory(condition:string): void {
      this.medicalHistory.push({condition:condition, occurrence:true});
   }

   // TODO:
   // TODO: FIX HISTORY DELETION BUG: historyIndex is always "-1", cannot find index by object and its values
   // TODO:

   deleteMedicalHistory(condition:string): void {
      let historyVal = {condition:condition, occurrence:true};
      let historyIndex = this.medicalHistory.indexOf(historyVal);
      console.log(historyIndex);
      if (historyIndex > -1) {
         this.medicalHistory.splice(historyIndex, 1);
      }
   }


   async onUserInfoSubmit() {

      // Start the loading animation on the modal's submit button
      this.isUserInfoModalLoading = true;

      // Recalculate the values and validations of form controls
      for (const i in this.userInfoForm.controls) {
        this.userInfoForm.controls[ i ].markAsDirty();
        this.userInfoForm.controls[ i ].updateValueAndValidity();
      }

      // Construct EhrPatientInfo object from form data
      let pateintInfo = this.getPatientInfo();

      // Save patient info on local DB
      await this.savePatientInfo(pateintInfo).then(success => {

         if (success) {
            this.setUserHasSavedInfo();
         }

      });

   }


   private getPatientInfo(): PatientInfo {

      // Get current user email
      let userEmail = this.authSerice.getCurrentUser().email;
      let userID = this.authSerice.getCurrentUser().id;
      let selectedCountry = this.userInfoForm.get("countryCtrl").value;
      let selectedCity = this.userInfoForm.get("cityCtrl").value;
      let userCountry = '';
      let userCity = '';

      if (selectedCountry && selectedCity) {
         userCountry = selectedCountry.name;
         userCity = selectedCity.matching_full_name;
      }

      // Construct a PatientInfo object using form data
      let userInfo:PatientInfo = {
         name: this.userInfoForm.get("nameCtrl").value,
         gender: this.userInfoForm.get("genderSelectCtrl").value,
         country: userCountry,
         city: userCity,
         address: this.userInfoForm.get("addressCtrl").value,
         phone: this.userInfoForm.get("phoneCtrl").value,
         birthDate: this.userInfoForm.get("birthCtrl").value.getTime(),
         email: userEmail,
         userID: userID
      }

      return userInfo;
   }


   private async savePatientInfo(patientInfo:PatientInfo): Promise<boolean> {

      let success:boolean;

      // Get current user ID
      let userID = this.authSerice.getCurrentUser().id;

      this.recordService.ensureUserRecordDbConnection(userID);

      // Map the info into an EhrPatientInfo entity
      let ehrPatientInfo: EhrPatientInfo = ModelMapper.mapPatientInfoToEhrPatientInfo(patientInfo);

      // Initialize a record and add the data to it
      let userRecord: MedicalRecord = new MedicalRecord();

      // Add allergies data
      let ehrAllergies:EhrAllergyAndReaction[] = ModelMapper.mapAllergiesToEhrAllergies(this.allergies);
      userRecord.allergies = ehrAllergies;

      // Add history conditions data
      let ehrHistory:EhrHistory[] = ModelMapper.mapMedicalHistoryToEhrHistory(this.medicalHistory);
      userRecord.history = ehrHistory;

      // Add user's personal info
      userRecord.patientData = ehrPatientInfo;

      // Save the record on local DB
      await this.databaseService.getDbConnection(userID, DbConnectionType.RECORD).manager.save(userRecord).then(
         response => {
            success = true;
         },

         error => {
            success = false;
         }
      );

      return success;
   }


   private setUserHasSavedInfo(): void {
      // Update the user info addition status boolean to true
      this.userService.updateUserInfoAdditionStatus().subscribe(

         response => {
            // Once successfully updated, close the modal
            this.isUserInfoModalLoading = false;
            this.modal.destroy();
         },

         error => {
            console.log(error);
         }

      );
   }

}
