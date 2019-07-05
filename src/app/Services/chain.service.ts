import { BlockSource } from './../Models/RTC/BlockSource';
import { BlockFetchResponse } from './../Models/RTC/BlockFetchResponse';
import { toNumber } from 'ng-zorro-antd';
import { BlockProvideRequest } from './../Models/RTC/BlockProvideRequest';
import { BlockAdditionResponse } from './../Models/Payload/Responses/BlockAdditionResponse';
import { first, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AddressService } from './address.service';
import { ProviderService } from './provider.service';
import { BlockAdditionRequest } from './../Models/Payload/Requests/BlockAdditionRequest';
import ModelMapper from 'src/app/Helpers/Utils/ModelMapper';
import { NodeNetworkService } from 'src/app/Services/node-network.service';
import { Block } from './../DataAccess/entities/Core/Block';
import { Connection } from 'typeorm';
import { DatabaseService } from 'src/app/DataAccess/database.service';
import { Injectable } from '@angular/core';
import * as MerkleTree from 'merkletreejs';
import sha256 from 'crypto-js/sha256';
import { throwError, Observable } from 'rxjs';


@Injectable({
   providedIn: 'root'
})


export class ChainService 
{
   chainGetUrl:string = environment.apiUrl + '/chain/chainget';
   chainUrl = environment.apiUrl + '/chain';


   constructor(
      private dbService:DatabaseService, private networkService:NodeNetworkService,
      private providerService:ProviderService, private addressService:AddressService,
      private http:HttpClient
   ) { }


   public async generateNetworkMerkleRoot(networkUUID:string): Promise<string>;
   public async generateNetworkMerkleRoot(networkUUID:string, additionalBlockHash:string): Promise<string>

   public async generateNetworkMerkleRoot(networkUUID:string, additionalBlockHash?:string): Promise<string>
   {
      // Get the network's leaves hashes for the construction of the merkle tree
      let leavesHexHashes:string[] = await this.getNetworkLeavesHashes(networkUUID);

      // Add the additional block's hash to the tree leaves
      if (additionalBlockHash) {
         leavesHexHashes.push(additionalBlockHash);
      }     

      // If there's only one leaf in the tree, return that leaf hash
      if (leavesHexHashes.length < 2) {
         return leavesHexHashes[0];
      }

      // Get buffer array from each Hex hash string
      let leavesBuffer:Buffer[] = leavesHexHashes.map(leaf => Buffer.from(leaf, 'hex'));

      // Construct a merkle tree using the buffer array
      let tree = new MerkleTree.default(leavesBuffer, sha256); 

      // Return the root of the tree
      return tree.getRoot().toString('hex');
   }


   private async getNetworkLeavesHashes(networkUUID:string): Promise<string[]>
   {
      // Make sure that a connection for the network DB exists
      await this.ensureNetworkDbConnection(networkUUID);
      
      // Get network's DB conneciton
      let db:Connection = this.dbService.getNetworkDbConnection(networkUUID);

      // Get number of blocks in chain
      const numberOfBlocks:number = await db.manager.count(Block);

      // Blocks hashes (merkle tree leaves) array
      let leavesHexHashes:string[] = [];

      // Get network's DB connection
      const dbConnection:Connection = await this.dbService.getNetworkDbConnection(networkUUID);

      // For each block
      for (let i=1; i<=numberOfBlocks; i++) 
      {
         // Get the leaf hash of the block with index of i
         const blockLeafHash:Block[] = await dbConnection.getRepository(Block).find({
            select: ["merkleLeafHash"],
            where: [{index : i}]
         });

         // Push the leaf hash into the leaves array
         leavesHexHashes.push(blockLeafHash[0].merkleLeafHash);   
      }

      return leavesHexHashes;
   }


   private async ensureNetworkDbConnection(networkUUID:string)
   {
      
      try 
      {
         // Get network DB connection
         await this.dbService.getNetworkDbConnection(networkUUID);
      }
      catch (error) 
      { 

         // If connection doesn't exists
         if ( (<Error>error).name == 'ConnectionNotFoundError' ) {

            // Create connection
            await this.dbService.createNetworkDbConnection(networkUUID);

         }
         // Any other error
         else {
            console.log(error);
         }

      }

   }


   /**
    * Fetches a range of blocks from providers of a network if both range indexes are zero then all of the network's blocks are fetched
    * @param consumerUUID  UUID of the node that requests the blocks
    * @param networkUUID   UUID of the network to fetch blocks from
    * @param rangeBegin    The index of the first block to fetch
    * @param rangeEnd      The index of the last block to fetch
    */
   public getNetworkChain(consumerUUID:string, networkUUID:string, rangeBegin:number, rangeEnd:number): Observable<any> {
      let url = environment.apiUrl + '/chain' +
      '?consumer-uuid=' + consumerUUID +
      '&network-uuid=' + networkUUID +
      '&range-begin=' + rangeBegin +
      '&range-end=' + rangeEnd;

      return this.http.get(url).pipe(first(), catchError(error => throwError(error)));
   }


   public async getNetworkBlock(networkUUID:string, blockID:number): Promise<Block> {

      await this.ensureNetworkDbConnection(networkUUID);

      let db:Connection = this.dbService.getNetworkDbConnection(networkUUID);

      const block:Block = await db.getRepository(Block).findOne({
         where: [{index : blockID}]
      });

      return block;

   }


   public async getNetworkLatestBlock(networkUUID:string): Promise<Block> {

      // Make sure that a connection for the network DB exists
      await this.ensureNetworkDbConnection(networkUUID);

      // Get network's DB conneciton
      let dbConnection:Connection = this.dbService.getNetworkDbConnection(networkUUID);

      let blocksCount:number = await dbConnection.manager.count(Block);

      const latestBlock:Block[] = await dbConnection.getRepository(Block).find({
         where: [{index : blocksCount}]
      });

      return latestBlock[0];

   }


   public async countAllNetworksBlocks(networksUUIDs:string[]): Promise<number> {
      let count: number = 0;  

      for (let networkUUID of networksUUIDs) {
         // Get the connection of the network
         let networkDb = this.dbService.getNetworkDbConnection(networkUUID);

         // Genesis block is subtracted
         const networkBlocksCount = await networkDb.getRepository(Block).count()-1;

         // Add the counted blocks of the network
         count = count + networkBlocksCount;
      }

      return count;
   }


   public async addBlock(blockAdditionResponse:BlockAdditionResponse) {

      let networkUUID:string = blockAdditionResponse.block.blockHeader.networkUUID;

      try {
         // Make sure that a connection has been established
         await this.networkService.ensureNetworkDbConnection(networkUUID);

         // Get a Block from the response
         let block = ModelMapper.mapBlockResponseToBlock(blockAdditionResponse.block);

         // Get DB connection for the network, then save the block
         await this.dbService.getNetworkDbConnection(networkUUID).manager.save(block);
      }
      catch (e) {
         console.error(e);
         return;
      }

      // Update merkle root for broadcasted blocks
      if (blockAdditionResponse.metadata.blockSource === BlockSource.BROADCAST) {
         let updatedMerkleRoot:string = await this.generateNetworkMerkleRoot(networkUUID);
         // Complete the transaction by updating the network's merkle root
         this.networkService.updateNetworkMerkleRoot(blockAdditionResponse, updatedMerkleRoot);
      }
   }


   public async sendBlock(blockRequest:BlockProvideRequest) {

      // Get the network chain's merkle root
      let networkRoot = await this.generateNetworkMerkleRoot(blockRequest.networkUUID);

      // Get the block with blockId from network
      let block = await this.getNetworkBlock(blockRequest.networkUUID, toNumber(blockRequest.blockId, 1));

      // Construct a block response
      let blockResponse:BlockAdditionResponse = {
         block: ModelMapper.mapBlockToBlockResponse(block),
         metadata: null
      }

      // Construct a BlockFetchResponse
      let blockFetchResponse:BlockFetchResponse = {
         blockResponse: blockResponse,
         consumerUUID: blockRequest.consumerUUID,
         networkUUID: blockRequest.networkUUID,
         networkChainRoot: networkRoot
      }

      console.log(blockFetchResponse);

      // Send the BlockFetchResponse
      this.http.post(this.chainUrl, blockFetchResponse).subscribe(
         response => console.log(response),
         error => console.log(error)
      );

   }


   public async generateBlockAdditionRequest(providerUserId:number, ehrUserId:number, networkUuid:string): Promise<BlockAdditionRequest>
   {
      let providerID = providerUserId;
      let ehrUserID = ehrUserId;
      let networkUUID = networkUuid;
      let merkleRootWithoutBlock:string = "";
      let previousBlockHash:string = "";
      let previousBlockIndex:number;
      let senderAddress:string = "";
      let providerUUID:string = "";

      // Get and set provider UUID
      await this.getCurrentProviderUUID().then(uuid => {
         providerUUID = uuid;
      });

      // Get and set merkle root
      await this.generateNetworkMerkleRoot(networkUUID).then(root => {
         merkleRootWithoutBlock = root;
      });

      // Get and set sender address
      await this.addressService.getUserAddress(providerID).then(address => {
         senderAddress = address.address;
      });

      // Get and set block index and previous hash
      await this.getNetworkLatestBlock(networkUUID).then(block => {
         previousBlockIndex = block.index;
         previousBlockHash = block.hash;
      });

      // Construct a block addition object
      let blockAdditionRequest:BlockAdditionRequest = {
         chainRootWithoutBlock:merkleRootWithoutBlock,
         previousBlockIndex: previousBlockIndex.toString(),
         previousBlockHash: previousBlockHash,
         senderAddress: senderAddress,
         providerUUID: providerUUID,
         networkUUID: networkUUID,
         ehrUserID: ehrUserID.toString()
      }

      return blockAdditionRequest;
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
}
