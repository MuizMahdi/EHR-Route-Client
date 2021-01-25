import { Injectable } from '@angular/core';
import { ipcRenderer, webFrame, remote } from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { DbConnectionType } from '../../../Models/DbConnectionType';
import { AppConfig } from '../../../../environments/environment';


@Injectable({
   providedIn: 'root'
})


export class ElectronService {

   public databaseFolderPath: string;
   public applicationPath: string;
   private dataFolderPath: string;

   ipcRenderer: typeof ipcRenderer;
   webFrame: typeof webFrame;
   remote: typeof remote;
   childProcess: typeof childProcess;
   fs: typeof fs;
   path: typeof path;


   get isElectron(): boolean {
      return !!(window && window.process && window.process.type);
   }


   constructor() {
      if (this.isElectron) {
         this.ipcRenderer = window.require('electron').ipcRenderer;
         this.webFrame = window.require('electron').webFrame;
         this.remote = window.require('electron').remote;
         this.childProcess = window.require('child_process');
         this.fs = window.require('fs');
         this.path = window.require('path');
      }
   }



   public initDb(): void {
      this.initPaths();
   }


   private initPaths() {

      // Use 'userData' electron path to store db files on production
      if(AppConfig.production) {
         this.dataFolderPath = '/';
         this.applicationPath = this.remote.app.getPath('userData');
      } 
      else {
         // Use dist/assets/data to store database files for development
         this.dataFolderPath = 'dist/assets/data';
         this.applicationPath = this.remote.app.getAppPath();
      }
 
      this.databaseFolderPath = this.path.join(this.applicationPath, this.dataFolderPath); 

   }


   // // returns a DB path for a given DB type and identifier
   public getDbPath(identifier: string|number, connectionType: DbConnectionType): string {
      

      switch(connectionType) {

         case DbConnectionType.NETWORK: {
            let dbFileName = identifier + '.chain';
            return this.path.join(this.databaseFolderPath, dbFileName);
         }

         case DbConnectionType.ADDRESS: {
            let dbFileName = 'user-address-' + identifier + '.address';
            return this.path.join(this.databaseFolderPath, dbFileName);
         }

         case DbConnectionType.PATIENT_INFO: {
            let dbFileName = 'user-info-' + identifier + '.info';
            return this.path.join(this.databaseFolderPath, dbFileName);
         }

         case DbConnectionType.RECORD: {
            let dbFileName = 'user-record-' + identifier + '.ehr';
            return this.path.join(this.databaseFolderPath, dbFileName);
         }

         default: return '';

      }

   }
   
}
