import { ErrorResponse } from '../Models/Payload/Responses/ErrorResponse';
import { AppConfig } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { DbConnectionType } from '../Models/DbConnectionType';
import { ElectronService } from '../core/services';


// NodeJs FileSystem
declare var fs: any;


@Injectable({
  providedIn: 'root'
})


export class ChainFileService 
{
   
   chainSendUrl:string = AppConfig.apiUrl + '/chain'


   constructor(
      private electron: ElectronService
   ) { }

   
   public sendNetworkChain(networkUUID:string, consumerUUID:string): any
   {
      let filePath:string = this.electron.getDbPath(networkUUID, DbConnectionType.NETWORK);

      let url = this.chainSendUrl + '?consumeruuid=' + consumerUUID + '&networkuuid=' + networkUUID;

      fs.readFile(filePath, (error, fileData) => {

         if (error) {
            console.log(error);
         }

         this.uploadChainFile(fileData, url);

      });

   }


   uploadChainFile(file:any, uploadUri:string): any {

      let formData = new FormData();

      formData.append('file', new Blob([file]));

      const options = {
         method: 'POST',
         body: formData
      };

      fetch(uploadUri, options).then(

         (success) => console.log(success)

      ).catch(

         (error:ErrorResponse) => console.log(error)
         
      );
      
   }


   downloadChainFile(chainURL:string) {

      if(this.electron.isElectron) {

         // Start download
         this.electron.ipcRenderer.send('download', {
            url: chainURL,
            properties: {directory: this.electron.databaseFolderPath}
         });

         // On download complete
         this.electron.ipcRenderer.on('DownloadComplete', () => {
            console.log('[ Chain file download has completed ]');
         });

      }

   }
}
