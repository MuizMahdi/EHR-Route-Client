import { Router } from '@angular/router';
import { AuthService } from 'src/app/Services/auth.service';
import { Component, OnInit } from '@angular/core';
import { MainLayoutService } from './Services/main-layout.service';
import AppUtil from './Helpers/Utils/AppUtil';
import { IpcRenderer } from 'electron';


@Component({
   selector: 'app-root',
   templateUrl: './app.component.html',
   styleUrls: ['./app.component.css']
})


export class AppComponent implements OnInit
{
   private ipc: IpcRenderer;

   constructor(public mainLayout:MainLayoutService, private authService:AuthService, private router:Router) {
      this.initIpcRenderer();
   }

   ngOnInit() {
      this.listenToAppChanges();
   }

   initIpcRenderer() {
      // If app is running in electron
      if ((<any>window).require) {
         try {
            this.ipc = (<any>window).require('electron').ipcRenderer;
         } catch (e) {
            throw e;
         }
      } else {
         AppUtil.createMessage("error", "App not running in electron");
      }
   }

   listenToAppChanges() {
      // When app is about to be closed
      this.ipc.addListener('app-close', async () => {
         await this.authService.logout();
         //this.mainLayout.hide();
         await this.router.navigate(['login']);         
         this.delay(3000).then(() => {
            // Send a message to the main renderer to close the window
            this.ipc.send('closed');
         });
      });
   }

   async delay(ms: number) {
      await new Promise(resolve => setTimeout(() => resolve(), ms));

      /*
      setTimeout(() => {
         // Send a message to the main renderer to close the window
         this.ipc.send('closed');
      }, 3000);
      */
   }
}
