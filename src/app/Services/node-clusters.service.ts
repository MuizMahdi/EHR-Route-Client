import { BlockProvideRequest } from './../Models/RTC/BlockProvideRequest';
import { NodeMessageType } from './../Models/RTC/NodeMessageType';
import { BlockAdditionResponse } from './../Models/Payload/Responses/BlockAdditionResponse';
import { ChainService } from './chain.service';
import { ProviderService } from './provider.service';
import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { EventSourcePolyfill, OnMessageEvent } from 'ng-event-source';
import { environment } from 'src/environments/environment';
import { catchError, first } from 'rxjs/operators';

/**
 * Manages all node clusters' server sent events' connections and messages handlers.
 * @export
 * @class NodeClustersService
 * @implements {OnInit}
*/

@Injectable({
   providedIn: 'root'
})


export class NodeClustersService implements OnInit
{
   providerSubscriptionUrl:string = environment.apiUrl + "/cluster/providers?nodeuuid=";
   consumerSubscriptionUrl:string = environment.apiUrl + "/cluster/consumers?nodeuuid=";
   clustersUnsubscripeUrl:string = environment.apiUrl + "/cluster/close?nodeuuid=";
   providersEventSource:EventSourcePolyfill;
   consumersEventSource:EventSourcePolyfill;


   constructor(
      private chainService:ChainService, private providerService:ProviderService,
      private http:HttpClient
   ) { }


   ngOnInit() {
      this.unsubscribeClusters();
   }


   private async getCurrentNodeUUID(): Promise<string> {
      let nodeUUID:string;
      
      await this.providerService.getCurrentProviderUUID().then(
         response => {
            nodeUUID = response.payload;
         })
         .catch(error => {
            console.log(error);
         }
      );
      
      return nodeUUID;
   }


   public async subscribeClusters() {
      // Subscribe node as a provider
      await this.subscribeProvider();
      // Subscribe node as a consumer
      await this.subscribeConsumer();
   }


   public async subscribeProvider() {
      let nodeUUID:string = await this.getCurrentNodeUUID();
      let uri:string = this.providerSubscriptionUrl + nodeUUID;
      let Jwt = localStorage.getItem('accessToken');

      if (!this.providersEventSource) {
         this.providersEventSource = new EventSourcePolyfill(uri, {headers: {Authorization: "Bearer " + Jwt}});

         this.providersEventSource.addEventListener(NodeMessageType.HEART_BEAT.toString(), async (event:any) => {
            console.log('Provider HeartBeat: ' + event.data);
         });
   
         this.providersEventSource.addEventListener(NodeMessageType.BLOCK_PROVIDE_REQUEST.toString(), async (event:any) => {
            let blockRequest:BlockProvideRequest = JSON.parse(event.data);
            this.chainService.sendBlock(blockRequest);
         });
      }
   }


   public async subscribeConsumer() {
      let nodeUUID:string = await this.getCurrentNodeUUID();
      let url:string = this.consumerSubscriptionUrl + nodeUUID;
      let Jwt = localStorage.getItem('accessToken');

      if (!this.consumersEventSource) {
         this.consumersEventSource = new EventSourcePolyfill(url, {headers: {Authorization: "Bearer " + Jwt}});

         this.consumersEventSource.addEventListener(NodeMessageType.HEART_BEAT.toString(), async (event:any) => {
            console.log('Consumer HeartBeat: ' + event.data);
         });
   
         this.consumersEventSource.addEventListener(NodeMessageType.BLOCK.toString(), (event:any) => {
            let blockResponse:BlockAdditionResponse = JSON.parse(event.data);
            console.log(blockResponse);
            this.chainService.addBlock(blockResponse);
         });
      }
   }


   public async unsubscribeClusters(): Promise<any> {
      console.log("[ClusterService] Sending unsubscribe request...");

      return new Promise<any>(async (resolve, reject) => {

         let nodeUUID:string = "";

         // Get and set node UUID as the current provider UUID
         await this.getCurrentNodeUUID().then(uuid => {
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


   public resetClustersSubscription(): void {
      this.unsubscribeClusters().then(() => {
         this.subscribeClusters();
      });
   }


   public closeSseConnection(): void {
      // If event source exists
      if (this.providersEventSource) {
         // And connection is open 
         if (this.providersEventSource.OPEN || this.providersEventSource.CONNECTING) {

            // Close the connection
            this.providersEventSource.close();

            // Set event source as undefined so we could subscribe again
            this.providersEventSource = undefined;

            console.log("[ClusterService] Providers SSE connection has been closed successfully.");
         }
      }

      if (this.consumersEventSource) {
         if (this.consumersEventSource.OPEN || this.consumersEventSource.CONNECTING) {

            this.consumersEventSource.close();

            this.consumersEventSource = undefined;
            
            console.log("[ClusterService] Consumers SSE connection has been closed successfully.");
         }
      } 
   }
}
