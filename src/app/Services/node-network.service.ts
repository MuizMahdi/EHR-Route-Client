import { environment } from './../../environments/environment';
import { BlockResponse } from './../Models/Payload/Responses/BlockResponse';
import { BlockAdditionResponse } from './../Models/Payload/Responses/BlockAdditionResponse';
import { DatabaseService } from './../DataAccess/database.service';
import { UserNetworks } from './../Models/Payload/Responses/UserNetworks';
import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { catchError, first, tap } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';
import { NetworkInvitationRequest } from '../Models/Payload/Requests/NetworkInvitationRequest';
import { NetworkInfo } from '../Models/Payload/Responses/NetworkInfo';
import { ErrorResponse } from '../Models/Payload/Responses/ErrorResponse';


@Injectable({
   providedIn: 'root'
})


export class NodeNetworkService implements OnInit
{
   
   private userNetworkUrl:string = environment.apiUrl + '/users/current/networks';
   private networkRootUrl:string = environment.apiUrl + '/network/merkle-root';
   private createNetworkUrl:string = environment.apiUrl + '/network/create';
   private networkInviteUrl:string = environment.apiUrl + '/network/invite';
   private networkInvitationAcceptUrl:string = environment.apiUrl + '/network/invitation-accept';
   private searchNetworksByNameUrl:string = environment.apiUrl + '/network/search-by-name';
   private getNetworkUuidByNameUrl:string = environment.apiUrl + '/network/uuid';
   private networkDetailsUrl:string = environment.apiUrl + '/network/details';


   public userNetworks:NetworkInfo[];
   public userHasNetwork:boolean = false;

   
   constructor(private http:HttpClient, private dbService:DatabaseService) { }


   ngOnInit() 
   { }


   public checkUserNetworks() 
   {

      this.getUserNetworks().subscribe(

         (response:UserNetworks) => {
            // If network response is received then user has a network or more.
            this.userHasNetwork = true;

            // Networks the user joined
            this.userNetworks = response.userNetworks;

            // Ensure that a connection is established for each network's database
            this.ensureNetworksDBsConnection(this.userNetworks);
         },

         (error:ErrorResponse) => {
            // If Http NOT_FOUND status is returned
            if (error.httpStatus === 404) {
               this.userHasNetwork = false;
            }
         }

      );

   }


   public async ensureNetworkDbConnection(networkUUID:string) 
   {
      try {
         this.dbService.getNetworkDbConnection(networkUUID);
      }
      catch (error) {
         // If no connection for network's DB is available, then create a connection
         if ( (<Error>error).name == 'ConnectionNotFoundError' ) {
            await this.dbService.createNetworkDbConnection(networkUUID);
         }
         else {
            console.log(error);
         }
      }
   }


   public ensureNetworksDBsConnection(userNetworks:NetworkInfo[])
   {
      // If user has networks
      if (this.userHasNetwork)
      {
         userNetworks.forEach(async network => {
 
            // Get the DB connection of network's DB
            try
            {
               this.dbService.getNetworkDbConnection(network.networkUUID);
            }
            catch (error)
            {

               // If no connection for network's DB is available, then create a connection
               if ( (<Error>error).name == 'ConnectionNotFoundError' ) {
                  await this.dbService.createNetworkDbConnection(network.networkUUID);
               }
               else {
                  console.log(error);
               }

            }
                       
         });
      }
   }


   public getUserNetworks(): Observable<any> {
      
      return this.http.get(this.userNetworkUrl).pipe(first(),

         catchError(error => {
            return throwError(error);
         })
         
      );
      
   }


   public async getUserNetworksUUIDs(): Promise<string[]>
   {
      let networkUUIDs:string[] = [];

      return this.getUserNetworks().toPromise().then((response:UserNetworks) => { 
  
         let userNetworks: NetworkInfo[] = response.userNetworks;

         userNetworks.forEach(network => {
            networkUUIDs.push(network.networkUUID);
         });

         return networkUUIDs;
         
      });
   }


   public getNetworkRoot(networkUUID:string): Observable<any> {

      let url:string = this.networkRootUrl + '?networkuuid=' + networkUUID;

      return this.http.get(url).pipe(first(),

         catchError(error => {
            return throwError(error);
         })

      );

   }


   public getNetworkDetails(networkUUID:string): Observable<any> {

      let url:string = this.networkDetailsUrl + '?networkuuid=' + networkUUID;

      return this.http.get(url).pipe(first(),

         catchError(error => {
            return throwError(error);
         })

      );

   }


   public getNetworkUuidByName(networkName:string): Observable<any> {

      let url = this.getNetworkUuidByNameUrl + "?name=" + networkName;

      return this.http.get(url).pipe(first(),
      
         catchError(error => {
            return throwError(error);
         })

      );

   }


   public searchNetworksByName(networkName:string): Observable<any> {

      let searchUrl = this.searchNetworksByNameUrl + "?keyword=" + networkName;

      return this.http.get(searchUrl).pipe(first(),
      
         catchError(error => {
            return throwError(error);
         })

      );

   }

   
   public generateNetwork(networkName:string): Observable<any> {

      return this.http.post(this.createNetworkUrl, networkName).pipe(first(),
         
         catchError(error => {
            return throwError(error);
         })

      );

   }


   public sendNetworkInvitationRequest(invitationRequest:NetworkInvitationRequest): Observable<any> {

      return this.http.post(this.networkInviteUrl, invitationRequest).pipe(first(),
      
         catchError(error => {
            return throwError(error);
         })

      );

   }


   public networkInvitationAccept(invitationResponse:NetworkInvitationRequest): Observable<any> {
      return this.http.post(this.networkInvitationAcceptUrl, invitationResponse).pipe(
         catchError(error => { return throwError(error) })
      );
   }


   public updateNetworkMerkleRoot(blockAdditionResponse:BlockAdditionResponse, latestMerkleRoot:string) {

      let block:BlockResponse = blockAdditionResponse.block;

      // Construct a root update request object
      let networkRootUpdateRequest = {
         merkleRoot: latestMerkleRoot,
         networkUUID: block.blockHeader.networkUUID,
         consentRequestUUID: blockAdditionResponse.metadata.requestUUID
      }

      // Send the request
      this.http.post(this.networkRootUrl, networkRootUpdateRequest).subscribe();

   }
}
