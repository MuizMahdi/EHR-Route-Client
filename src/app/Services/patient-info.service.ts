import { UserRecordService } from './user-record.service';
import { DbConnectionType } from './../Models/DbConnectionType';
import { Connection } from 'typeorm';
import { EhrPatientInfo } from './../DataAccess/entities/EHR/EhrPatientInfo';
import { DatabaseService } from './../DataAccess/database.service';
import { Injectable } from '@angular/core';


@Injectable({
   providedIn: 'root'
})


export class PatientInfoService 
{
   constructor(private dbService:DatabaseService, private recordService:UserRecordService)
   { }


   public async getUserPateintInfo(userID:number): Promise<EhrPatientInfo> {

      // Make sure that a connection is available
      await this.recordService.ensureUserRecordDbConnection(userID);

      // Get user's PatientInfo DB connection
      const dbConnection:Connection = await this.dbService.getDbConnection(userID, DbConnectionType.RECORD);

      // Return the patient info
      return await dbConnection.manager.findOne(EhrPatientInfo, 1);

   }
}
