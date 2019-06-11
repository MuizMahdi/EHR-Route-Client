import { DbConnectionType } from '../Models/DbConnectionType';
import { MedicalRecord } from '../DataAccess/entities/EHR/MedicalRecord';
import { DatabaseService } from '../DataAccess/database.service';
import { Injectable } from '@angular/core';
import { Connection } from 'typeorm';


@Injectable({
   providedIn: 'root'
})


export class UserRecordService 
{
   constructor(private dbService:DatabaseService)
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


   public async getUserRecord(userID:number): Promise<MedicalRecord> {
      // Make sure that a connection is available
      await this.ensureUserRecordDbConnection(userID);
      
      // Get user's record DB connection
      const dbConnection:Connection = await this.dbService.getDbConnection(userID, DbConnectionType.RECORD);

      // Get number of records the user has to get the latest record
      let numberOfRecords:number = await dbConnection.manager.count(MedicalRecord, {});

      // Get the latest patient record
      const patientRecord:MedicalRecord = await dbConnection.manager.findOne(MedicalRecord, numberOfRecords);

      return patientRecord;
   }

}
