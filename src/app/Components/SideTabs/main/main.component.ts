import { Component, OnInit } from '@angular/core';
import { NetworkInfo } from './../../../Models/Payload/Responses/NetworkInfo';
import { UserNetworks } from './../../../Models/Payload/Responses/UserNetworks';
import { ErrorResponse } from './../../../Models/Payload/Responses/ErrorResponse';
import { DatabaseService } from './../../../DataAccess/database.service';
import { NodeNetworkService } from 'src/app/Services/node-network.service';
import { MainLayoutService } from './../../../Services/main-layout.service';
import { NodeClustersService } from 'src/app/Services/node-clusters.service';


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})


export class MainComponent implements OnInit
{
   
   constructor(public mainLayout:MainLayoutService, private clustersService:NodeClustersService) 
   {
      this.mainLayout.show();
   }


   async ngOnInit() 
   {
      // Handles when user reloads page after loggin in, to show a prompt, which 
      // allows for a request to be made, unsubscribing the node from clusters.
      //this.handleReloads();

      // Subscribe to providers and consumers cluster
      //this.clustersService.subscribeProvider();
      //this.clustersService.subscribeConsumer();
   }


   handleReloads(): void
   {
      var showMsgTimer;
      var clusterService = this.clustersService;

      // Before user refreshes page, show a prompt asking for confirmation
      window.onbeforeunload = function(evt) {       
         
         // Unsubscribe from clusters and close SSE http connections (EventSource connections)
         clusterService.unsubscribeClusters();

         showMsgTimer = window.setTimeout(showMessage, 500);
 
         evt.returnValue = '';
     
         return '';
      }
     
      window.onunload = function () {
         clearTimeout(showMsgTimer);
      }

      // If user decides to stay on page
      function showMessage() {
         // Subscribe to clusters again
         clusterService.subscribeClusters();
      }
   }

}
