import { DbConnectionType } from './../Models/DbConnectionType';
import { environment } from 'src/environments/environment';
import { remote } from 'electron';
import * as path from 'path';


export class ElectronAppConfig
{
   public static databaseFolderPath: string;
   public static applicationPath: string;
   private static dataFolderPath: string;


   public static initialize(): void {
      this.getPaths();
   }


   private static getPaths() {

      // Use 'userData' electron path to store db files on production
      if(environment.production) {
         this.dataFolderPath = '/';
         this.applicationPath = remote.app.getPath('userData');
      } 
      else {
         // Use dist/assets/data to store database files for development
         this.dataFolderPath = 'dist/assets/data';
         this.applicationPath = remote.app.getAppPath();
      }

      this.databaseFolderPath = path.join(this.applicationPath, this.dataFolderPath); 

   }


   // returns a DB path for a given DB type and identifier
   public static getDbPath(identifier: string|number, connectionType:DbConnectionType): string {

      switch(connectionType) {

         case DbConnectionType.NETWORK: {
            let dbFileName = identifier + '.chain';
            return path.join(this.databaseFolderPath, dbFileName);
         }

         case DbConnectionType.ADDRESS: {
            let dbFileName = 'user-address-' + identifier + '.address';
            return path.join(this.databaseFolderPath, dbFileName);
         }

         case DbConnectionType.PATIENT_INFO: {
            let dbFileName = 'user-info-' + identifier + '.info';
            return path.join(this.databaseFolderPath, dbFileName);
         }

         case DbConnectionType.RECORD: {
            let dbFileName = 'user-record-' + identifier + '.ehr';
            return path.join(this.databaseFolderPath, dbFileName);
         }

         default: return null;

      }

   }
}