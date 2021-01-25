import { MedicalRecordResponse } from './../../Models/Payload/Responses/MedicalRecordResponse';
import { EhrPatientInfo } from './../../DataAccess/entities/EHR/EhrPatientInfo';
import { PatientInfo } from './../../Models/Payload/Requests/PatientInfo';
import { Address } from './../../DataAccess/entities/Core/Address';
import { AddressResponse } from './../../Models/Payload/Responses/AddressResponse';
import { EhrAllergyAndReaction } from './../../DataAccess/entities/EHR/EhrAllergyAndReaction';
import { EhrCondition } from './../../DataAccess/entities/EHR/EhrCondition';
import { MedicalRecord } from './../../DataAccess/entities/EHR/MedicalRecord';
import { Block } from './../../DataAccess/entities/Core/Block';
import { BlockResponse } from '../../Models/Payload/Responses/BlockResponse';
import { EhrHistory } from '../../DataAccess/entities/EHR/EhrHistory';


export default class ModelMapper
{

   public static mapBlockResponseToBlock(blockResponse:BlockResponse): Block
   {
      const record = new MedicalRecord();
      record.patientData = blockResponse.transaction.record.patientInfo;
      record.history = [];
      record.conditions = [];
      record.allergies = [];

      let conditionsArr:any[] = blockResponse.transaction.record.problems;
      let allergiesArr:any[] = blockResponse.transaction.record.allergiesAndReactions;
      let historyObj:EhrHistory = blockResponse.transaction.record.history;
      let historyArr:any[] = [];

      if (historyObj !== null) {
         historyArr = Object.entries(historyObj);
      }

      conditionsArr.forEach(condition => {

         let recordCondition = new EhrCondition();

         recordCondition.medicalRecord = record;

         recordCondition.condition = condition;

         record.conditions.push(recordCondition);

      });

      allergiesArr.forEach(allergy => {

         let recordAllergy = new EhrAllergyAndReaction();

         recordAllergy.medicalRecord = record;

         recordAllergy.allergy = allergy;

         record.allergies.push(recordAllergy);

      });

      historyArr.forEach(history => {

         let recordHistory = new EhrHistory();

         recordHistory.medicalRecord = record;

         recordHistory.condition = history[0];
         recordHistory.occurrence = history[1];

         record.history.push(recordHistory);

      });

      const block = new Block();
      block.hash = blockResponse.blockHeader.hash;
      block.previousHash = blockResponse.blockHeader.previousHash;
      block.timeStamp = blockResponse.blockHeader.timeStamp;
      block.merkleLeafHash = blockResponse.blockHeader.merkleLeafHash;
      block.networkUUID = blockResponse.blockHeader.networkUUID;
      block.transactionId = blockResponse.transaction.transactionId;
      block.senderPubKey = blockResponse.transaction.senderPubKey;
      block.senderAddress = blockResponse.transaction.senderAddress;
      block.recipientAddress = blockResponse.transaction.recipientAddress;
      block.signature = blockResponse.transaction.signature;
      block.medicalRecord = record;

      return block;
   }


   public static mapAddressResponseToAddress(addressResponse:AddressResponse): Address
   {
      const address = new Address();

      address.address = addressResponse.address;
      address.publicKey = addressResponse.publicKey;
      address.privateKey = addressResponse.privateKey;
      
      return address;
   }


   public static mapPatientInfoToEhrPatientInfo(patientInfo:PatientInfo): EhrPatientInfo
   {
      const ehrPatientInfo = new EhrPatientInfo();

      ehrPatientInfo.name = patientInfo.name;
      ehrPatientInfo.phone = patientInfo.phone;
      ehrPatientInfo.birthDate = patientInfo.birthDate;
      ehrPatientInfo.email = patientInfo.email;
      ehrPatientInfo.gender = patientInfo.gender;
      ehrPatientInfo.city = patientInfo.city;
      ehrPatientInfo.country = patientInfo.country;
      ehrPatientInfo.address = patientInfo.address;
      ehrPatientInfo.userID = patientInfo.userID;

      return ehrPatientInfo;
   }


   public static mapEhrPatientInfoToPatientInfo(ehrPatientInfo:EhrPatientInfo): PatientInfo
   {
      const patientInfo:PatientInfo = {
         name: ehrPatientInfo.name,
         gender: ehrPatientInfo.gender,
         country: ehrPatientInfo.country,
         city: ehrPatientInfo.city,
         address: ehrPatientInfo.address,
         phone: ehrPatientInfo.phone,
         birthDate: ehrPatientInfo.birthDate,
         email: ehrPatientInfo.email,
         userID: ehrPatientInfo.userID
      }

      return patientInfo;
   }


   public static mapRecordToRecordResponse(medicalRecord:MedicalRecord): MedicalRecordResponse {

      const recordResponse:MedicalRecordResponse = {
         patientInfo: this.mapEhrPatientInfoToPatientInfo(medicalRecord.patientData),
         problems: this.mapEhrConditionsToConditions(medicalRecord.conditions),
         allergiesAndReactions: this.mapEhrAllergiesToAllergies(medicalRecord.allergies),
         history: this.mapEhrHistoryToHistoryList(medicalRecord.history)
      }

      return recordResponse;

   }


   public static mapAllergiesToEhrAllergies(allergies:string[]): EhrAllergyAndReaction[] {

      let ehrAllergies:EhrAllergyAndReaction[] = [];

      allergies.forEach(allergy => {
         let ehrAllergy:EhrAllergyAndReaction = new EhrAllergyAndReaction();
         ehrAllergy.allergy = allergy;
         ehrAllergies.push(ehrAllergy);
      });

      return ehrAllergies;

   }


   public static mapEhrAllergiesToAllergies(ehrAllergies:EhrAllergyAndReaction[]): string[] {

      let allergies:string[] = [];

      ehrAllergies.forEach(ehrAllergy => {
         allergies.push(ehrAllergy.allergy);
      });

      return allergies;

   }


   public static mapMedicalHistoryToEhrHistory(medicalHistory:{condition:string, occurrence:boolean}[]): EhrHistory[] {

      let ehrHistoryConditions:EhrHistory[] = [];

      medicalHistory.forEach(history => {
         let ehrHistory:EhrHistory = new EhrHistory();
         ehrHistory.condition = history.condition;
         ehrHistory.occurrence = history.occurrence;
         ehrHistoryConditions.push(ehrHistory);
      });

      return ehrHistoryConditions;
   }


   public static mapEhrHistoryToHistoryList(ehrHistory:EhrHistory[]): string[] {

      let medicalHistory:any[] = [];

      ehrHistory.forEach(ehrHistoryEntry => {
         let historyEntry = {
            [ehrHistoryEntry.condition]:ehrHistoryEntry.occurrence
         }
         medicalHistory.push(historyEntry);
      });

      return medicalHistory;

   }


   public static mapConditionsToEhrConditions(conditions:string[]): EhrCondition[] {

      let ehrCondtions:EhrCondition[] = [];

      conditions.forEach(condition => {
         let ehrCondition:EhrCondition = new EhrCondition();
         ehrCondition.condition = condition;
         ehrCondtions.push(ehrCondition);
      });

      return ehrCondtions;

   }


   public static mapEhrConditionsToConditions(ehrConditions:EhrCondition[]): string[] {

      let medicalConditions:string[] = [];

      ehrConditions.forEach(ehrCondition => {
         medicalConditions.push(ehrCondition.condition);
      });

      return medicalConditions;

   }
}
