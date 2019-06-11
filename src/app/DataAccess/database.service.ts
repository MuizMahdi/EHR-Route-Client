import { DbConnectionType } from './../Models/DbConnectionType';
import { Injectable } from "@angular/core";
import { Connection, ConnectionOptions, createConnection, getConnectionManager } from 'typeorm';
import { ElectronAppConfig } from "../Configuration/ElectronAppConfig";
import { Block } from "./entities/Core/Block";
import { MedicalRecord } from "./entities/EHR/MedicalRecord";
import { EhrAllergyAndReaction } from "./entities/EHR/EhrAllergyAndReaction";
import { EhrCondition } from "./entities/EHR/EhrCondition";
import { EhrHistory } from "./entities/EHR/EhrHistory";
import { EhrPatientInfo } from "./entities/EHR/EhrPatientInfo";
import { Address } from "./entities/Core/Address";


@Injectable({
   providedIn: 'root'
})


/* 
*   A Network DB file is created for each database.
*   A connection is created for each network's DB on startup
*/


export class DatabaseService 
{ 
   constructor() { 
      ElectronAppConfig.initialize();
   }


   /** Network DB **/
   // Creates a connection to the network db with networkUUID
   public async createNetworkDbConnection(networkUUID:string)
   {
      let dbOptions:ConnectionOptions = {
         name: this.getConnectionName(networkUUID, DbConnectionType.NETWORK),
         type: "sqlite",
         database: ElectronAppConfig.getDbPath(networkUUID, DbConnectionType.NETWORK),
         entities: [
            Block,
            MedicalRecord,
            EhrAllergyAndReaction,
            EhrCondition,
            EhrHistory,
            EhrPatientInfo
         ],
         synchronize: true,
         logging: false
      }

      await createConnection(dbOptions);
   }


   // Returns a connection for the network with networkUUID
   public getNetworkDbConnection(networkUUID:string): Connection
   {
      return getConnectionManager().get(this.getConnectionName(networkUUID, DbConnectionType.NETWORK));
   }


   /** Address DB **/
   // Creates a connection to the address db with user ID
   public async createAddressDbConnection(userID:number)
   {
      let dbOptions:ConnectionOptions = {
         name: this.getConnectionName(userID, DbConnectionType.ADDRESS),
         type: "sqlite",
         database: ElectronAppConfig.getDbPath(userID, DbConnectionType.ADDRESS),
         entities: [
            Address,
         ],
         synchronize: true,
         logging: false
      }

      await createConnection(dbOptions);
   }


   // Returns a connection for address DB of user with an ID
   public getAddressDbConnection(userID:number): Connection
   {
      return getConnectionManager().get(this.getConnectionName(userID, DbConnectionType.ADDRESS));
   }


   /** Patient Info DB **/
   // Creates a connection to the pateint info db with user ID
   public async createPatientInfoDbConnection(userID:number)
   {
      let dbOptions:ConnectionOptions = {
         name: this.getConnectionName(userID, DbConnectionType.PATIENT_INFO),
         type: "sqlite",
         database: ElectronAppConfig.getDbPath(userID, DbConnectionType.PATIENT_INFO),
         entities: [
            EhrPatientInfo,
         ],
         synchronize: true,
         logging: false
      }

      await createConnection(dbOptions);
   }


   // Returns a connection for patient info DB of user with an ID
   public getPatientInfoDbConnection(userID:number): Connection
   {
      return getConnectionManager().get(this.getConnectionName(userID, DbConnectionType.PATIENT_INFO));
   }


   /** User's medical record Info DB **/
   // Creates a connection to the user's record db with the user's ID
   public async createUserRecordDbConnection(userID:number) {

      let dbOptions:ConnectionOptions = {
         name: this.getConnectionName(userID, DbConnectionType.RECORD),
         type: "sqlite",
         database: ElectronAppConfig.getDbPath(userID, DbConnectionType.RECORD),
         entities: [
            MedicalRecord,
            EhrHistory,
            EhrCondition,
            EhrAllergyAndReaction,
            EhrPatientInfo
         ],
         synchronize: true,
         logging: false
      }

      await createConnection(dbOptions);

   }


   public getDbConnection(identifier: string|number, connectionType:DbConnectionType): Connection {
      return getConnectionManager().get(this.getConnectionName(identifier, connectionType));
   }


   // Constructs a connection name for a given database type using the identifier
   private getConnectionName(identifier: string|number, connectionType:DbConnectionType): string {
      switch(connectionType) {
         case DbConnectionType.NETWORK: return identifier + '-connection';
         case DbConnectionType.ADDRESS: return identifier + '-address';
         case DbConnectionType.PATIENT_INFO: return identifier + '-info';
         case DbConnectionType.RECORD: return identifier + '-ehr';
         default: return null;
      }
   }
}
