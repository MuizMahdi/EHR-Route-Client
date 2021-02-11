import { DbConnectionType } from './../Models/DbConnectionType';
import { Injectable } from "@angular/core";
import { Connection, ConnectionOptions, createConnection, getConnectionManager } from 'typeorm';
import { Block } from "./entities/Core/Block";
import { MedicalRecord } from "./entities/EHR/MedicalRecord";
import { EhrAllergyAndReaction } from "./entities/EHR/EhrAllergyAndReaction";
import { EhrCondition } from "./entities/EHR/EhrCondition";
import { EhrHistory } from "./entities/EHR/EhrHistory";
import { EhrPatientInfo } from "./entities/EHR/EhrPatientInfo";
import { Address } from "./entities/Core/Address";
import { ElectronService } from '../core/services';


@Injectable({
   providedIn: 'root'
})


/* 
*   A Network DB file is created for each database.
*   A connection is created for each network's DB on startup
*/


export class DatabaseService 
{

   constructor(private electron: ElectronService) {
      electron.initPaths();
   }


   /** Network DB **/
   // Creates a connection to the network db with networkUUID
   public async createNetworkDbConnection(networkUUID:string)
   {

      let dbOptions: ConnectionOptions = {
         name: this.getConnectionName(networkUUID, DbConnectionType.NETWORK),
         type: "sqlite",
         database: this.electron.getDbPath(networkUUID, DbConnectionType.NETWORK),
         key: 'secret',
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

      await this.electron.db.createConnection(dbOptions);

   }


   /** Address DB **/
   // Creates a connection to the address db with user ID
   public async createAddressDbConnection(userID:number)
   {
      
      let dbOptions: ConnectionOptions = {
         name: this.getConnectionName(userID, DbConnectionType.ADDRESS),
         type: "sqlite",
         database: this.electron.getDbPath(userID, DbConnectionType.ADDRESS),
         key: 'secret',
         entities: [
            Address,
         ],
         synchronize: true,
         logging: false
      }

      await this.electron.db.createConnection(dbOptions);

   }


   /** Patient Info DB **/
   // Creates a connection to the pateint info db with user ID
   public async createPatientInfoDbConnection(userID:number)
   {

      let dbOptions: ConnectionOptions = {
         name: this.getConnectionName(userID, DbConnectionType.PATIENT_INFO),
         type: "sqlite",
         database: this.electron.getDbPath(userID, DbConnectionType.PATIENT_INFO),
         key: 'secret',
         entities: [
            EhrPatientInfo,
         ],
         synchronize: true,
         logging: false
      }

      await this.electron.db.createConnection(dbOptions);

   }


   /** User's medical record Info DB **/
   // Creates a connection to the user's record db with the user's ID
   public async createUserRecordDbConnection(userID:number) {

      let dbOptions: ConnectionOptions = {
         name: this.getConnectionName(userID, DbConnectionType.RECORD),
         type: "sqlite",
         database: this.electron.getDbPath(userID, DbConnectionType.RECORD),
         key: 'secret',
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

      await this.electron.db.createConnection(dbOptions);

   }


   // Returns a connection for patient info DB of user with an ID
   public getPatientInfoDbConnection(userID:number): Connection {
      return this.electron.db.getConnectionManager().get(this.getConnectionName(userID, DbConnectionType.PATIENT_INFO));
   }


   public getDbConnection(identifier: string|number, connectionType:DbConnectionType): Connection {
      return this.electron.db.getConnectionManager().get(this.getConnectionName(identifier, connectionType));
   }


   // Returns a connection for address DB of user with an ID
   public getAddressDbConnection(userID:number): Connection {
      return this.electron.db.getConnectionManager().get(this.getConnectionName(userID, DbConnectionType.ADDRESS));
   }


   // Returns a connection for the network with networkUUID
   public getNetworkDbConnection(networkUUID:string): Connection {
      return this.electron.db.getConnectionManager().get(this.getConnectionName(networkUUID, DbConnectionType.NETWORK));
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
