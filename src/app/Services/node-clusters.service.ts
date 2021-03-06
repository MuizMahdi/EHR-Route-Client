import { ChainFileService } from './chain-file.service';
import { ChainFetch } from './../Models/Payload/Responses/ChainFetch';
import { ChainService } from './chain.service';
import { BlockResponse } from './../Models/Payload/Responses/BlockResponse';
import { ProviderService } from './provider.service';
import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { EventSourcePolyfill } from 'ng-event-source';
import { environment } from 'src/environments/environment';
import { catchError, first } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';


// Electron-DL download
declare var remote: any;


@Injectable({
  providedIn: 'root'
})


/*
*   This servie handles all node clusters(groups) server sent events end points
*   subscription and SSEs received.
*/


export class NodeClustersService implements OnInit
{
   providerSubscriptionUrl:string = environment.apiUrl + "/cluster/chainprovider?nodeuuid=";
   consumerSubscriptionUrl:string = environment.apiUrl + "/cluster/chainconsumer?nodeuuid=";
   clustersUnsubscripeUrl:string = environment.apiUrl + "/cluster/close?nodeuuid=";

   providersEventSource:EventSourcePolyfill;
   consumersEventSource:EventSourcePolyfill;


   constructor(
      private chainService:ChainService, private providerService:ProviderService,
      private http:HttpClient, private chainFileService:ChainFileService
   ) { }


   ngOnInit() {
     this.unsubscribeClusters();
   }


   private async getCurrentProviderUUID(): Promise<string>
   {
      let providerUUID:string;
      
      await this.providerService.getCurrentProviderUUID().then(
         
         response => {
            providerUUID = response.payload;
         })

         .catch(error => {
            console.log(error);
         }

      );
      
      return providerUUID;
   }


   public async subscribeClusters()
   {
      // Subscribe node as a provider
      await this.subscribeProvider();

      // Subscribe node as a consumer
      await this.subscribeConsumer();
   }


   public async subscribeProvider()
   {
      let nodeUUID:string = "";

      // Get and set node UUID as the current provider UUID
      await this.getCurrentProviderUUID().then(uuid => {
         nodeUUID = uuid;
      });

      let url:string = this.providerSubscriptionUrl + nodeUUID;

      let Jwt = localStorage.getItem('accessToken');

      if (!this.providersEventSource) 
      {
         console.log("[ Sending provider subscribe request ]");

         this.providersEventSource = new EventSourcePolyfill(
            url, 
            {headers: {Authorization: "Bearer " + Jwt}}
         );

         this.providersEventSource.onmessage = ((event:any) => {

            console.log(event.data);

         });

         this.providersEventSource.addEventListener('chain-request', (event:any) => {

            // Get the chain fetch request data from event data
            let chainFetchRequest:ChainFetch = JSON.parse(event.data);;

            // Send chain file
            this.chainFileService.sendNetworkChain(chainFetchRequest.networkUUID, chainFetchRequest.consumerUUID);

         });
      }

   }


   public async subscribeConsumer()
   {
      let nodeUUID:string = "";

      // Get and set node UUID as the current provider UUID
      await this.getCurrentProviderUUID().then(uuid => {
         nodeUUID = uuid;
      });

      let url:string = this.consumerSubscriptionUrl + nodeUUID;

      let Jwt = localStorage.getItem('accessToken');

      if (!this.consumersEventSource)
      {
         console.log("[ Sending consumer subscribe request ]");

         this.consumersEventSource = new EventSourcePolyfill(
            url, 
            {headers: {Authorization: "Bearer " + Jwt}}
         );

         this.consumersEventSource.onmessage = ((event:any) => {
            //console.log(event);
         });

         this.consumersEventSource.addEventListener('block', (event:any) => {
            // Get block from event data
            let block:BlockResponse = JSON.parse(event.data);
            let blockNetworkUUID = block.blockHeader.networkUUID;

            // Add the block to the block network's DB
            this.chainService.addBlock(blockNetworkUUID, block);
         });

         this.consumersEventSource.addEventListener('chain-response', (event:any) => {

            // Get the chain uri from data
            let chainURI:any = event.data;

            // Download the chain and save it locally
            this.chainFileService.downloadChainFile(chainURI);

         });
      }   
   }


   public async unsubscribeClusters(): Promise<any>
   {
      console.log("[ClusterService] Sending unsubscribe request...");

      return new Promise<any>(async (resolve, reject) => {

         let nodeUUID:string = "";

         // Get and set node UUID as the current provider UUID
         await this.getCurrentProviderUUID().then(uuid => {
            nodeUUID = uuid;
         });

         // Unsubscribe node from clusters on server-side
         await this.http.get(this.clustersUnsubscripeUrl + nodeUUID).pipe(first()).toPromise()
         .then(() => {

            console.log("[ClusterService] Unsubscribed on server-side successfully");

            // Close the SSE http connection from client-side
            this.closeSseConnection();

            resolve();

         })
         .catch(error => {
            console.log("[ClusterService] " + error);
            reject("Failed to unsubscribe node on server-side - " + error.message);
         });
         
      });
   }


   closeSseConnection():void 
   {
      // If event source exists
      if (this.providersEventSource) 
      {
         // And connection is open 
         if (this.providersEventSource.OPEN || this.providersEventSource.CONNECTING) {

            // Close the connection
            this.providersEventSource.close();

            // Set event source as undefined so we could subscribe again
            this.providersEventSource = undefined;

            console.log("[ClusterService] Providers SSE connection has been closed successfully.");
         }
      }

      if (this.consumersEventSource) 
      {
         if (this.consumersEventSource.OPEN || this.consumersEventSource.CONNECTING) {

            this.consumersEventSource.close();

            this.consumersEventSource = undefined;
            
            console.log("[ClusterService] Consumers SSE connection has been closed successfully.");
         }
      } 
   }

}
