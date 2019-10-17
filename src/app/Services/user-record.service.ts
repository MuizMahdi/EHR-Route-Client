import { MedicalRecord } from './../DataAccess/entities/EHR/MedicalRecord';
import { PatientInfo } from './../Models/Payload/Requests/PatientInfo';
import { EhrPatientInfo } from './../DataAccess/entities/EHR/EhrPatientInfo';
import { AuthService } from './auth.service';
import { MedicalRecordUpdates } from './../Models/Payload/Responses/MedicalRecordUpdates';
import { EhrCondition } from './../DataAccess/entities/EHR/EhrCondition';
import { EhrHistory } from './../DataAccess/entities/EHR/EhrHistory';
import { EhrAllergyAndReaction } from './../DataAccess/entities/EHR/EhrAllergyAndReaction';
import { DbConnectionType } from '../Models/DbConnectionType';
import { DatabaseService } from '../DataAccess/database.service';
import { Injectable } from '@angular/core';
import { Connection } from 'typeorm';
import ModelMapper from '../Helpers/Utils/ModelMapper';


@Injectable({
   providedIn: 'root'
})


export class UserRecordService 
{
   constructor(private dbService:DatabaseService, private authService:AuthService)
   { }


   public async ensureUserRecordDbConnection(userID:number) {

      // Get user record DB connection
      try {
         this.dbService.getDbConnection(userID, DbConnectionType.RECORD);
      }
      catch (error) {
         // If no connection for user's medical record DB is available
         if ( (<Error>error).name == 'ConnectionNotFoundError' ) {
            // Create a connection
            await this.dbService.createUserRecordDbConnection(userID);
         }
         else {
            console.log(error);
         }
      }
   }


   public async getCurrentUserRecord(): Promise<any> {
      let currentUserId = this.authService.getCurrentUser().id;
      return this.getUserRecord(currentUserId);
   }


   public async getUserRecord(userID:number): Promise<any> {
      
      // Make sure that a connection is available
      await this.ensureUserRecordDbConnection(userID);
      
      // Get user's record DB connection
      const dbConnection:Connection = await this.dbService.getDbConnection(userID, DbConnectionType.RECORD);

      // Get number of records the user has to get the latest record
      let recordsCount:number = await dbConnection.manager.count(MedicalRecord);

      // Get the latest patient record
      const patientRecord:MedicalRecord = await dbConnection.manager.findOne(MedicalRecord, recordsCount);

      // Find user's personal info
      let patientInfo:EhrPatientInfo = await dbConnection.manager.findOne(EhrPatientInfo, 1);

      // Find allergies of the latest record
      let allergies = await dbConnection.getRepository(EhrAllergyAndReaction).find({
         select: ["allergy"],
         where: [{medicalRecord: patientRecord}]
      });

      // Find history of the latest record
      let medicalHistory = await dbConnection.getRepository(EhrHistory).find({
         select: ["condition", "occurrence"],
         where: [{medicalRecord: patientRecord}]
      });

      // Find medical conditions of latest record
      let medicalConditions = await dbConnection.getRepository(EhrCondition).find({
         select: ["condition"],
         where: [{medicalRecord: patientRecord}]
      });

      // Add the medical data to a MedicalRecord entity and return it
      patientRecord.patientData = patientInfo;
      patientRecord.allergies = allergies;
      patientRecord.history = medicalHistory;
      patientRecord.conditions = medicalConditions;

      return patientRecord;
   }


   public async getUserEhrInfo(): Promise<EhrPatientInfo> {

      let currentUserId = this.authService.getCurrentUser().id;

      await this.ensureUserRecordDbConnection(currentUserId);

      // Get user's record DB connection
      const dbConnection:Connection = await this.dbService.getDbConnection(currentUserId, DbConnectionType.RECORD);
   
      // Get the user's info from their record
      return await dbConnection.getRepository(EhrPatientInfo).findOne();
   }


   public async getUserInfo(): Promise<PatientInfo> {
      return ModelMapper.mapEhrPatientInfoToPatientInfo(await this.getUserEhrInfo());
   }


   public async updateUserRecord(updates:MedicalRecordUpdates) {

      let currentUserId = this.authService.getCurrentUser().id;

      await this.ensureUserRecordDbConnection(currentUserId);

      // Get user's record DB connection
      const dbConnection:Connection = await this.dbService.getDbConnection(currentUserId, DbConnectionType.RECORD);
   
      // Initialize a new MedicalRecord
      let updatedRecord:MedicalRecord = new MedicalRecord();

      // Populate the updated record with the updates
      //updatedRecord.patientData = await this.getUserEhrInfo();
      updatedRecord.allergies = ModelMapper.mapAllergiesToEhrAllergies(updates.allergiesAndReactions);
      updatedRecord.conditions = ModelMapper.mapConditionsToEhrConditions(updates.problems);

      // Save the updated record
      dbConnection.getRepository(MedicalRecord).save(updatedRecord);
   }
}
