import { ElectronicHealthRecord } from './../Models/App/ElectronicHealthRecord';
import { BlockInfo } from './../Models/App/BlockInfo';
import { HealthRecordData } from './../Models/App/HealthRecordData';
import { MedicalRecord } from './../DataAccess/entities/EHR/MedicalRecord';
import { Block } from './../DataAccess/entities/Core/Block';
import { DatabaseService } from 'src/app/DataAccess/database.service';
import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})


/**
 * Handles fetching and editing Electronic Health Records (EHR) of patients of provider's networks
*/


export class EhrService
{
   userHasNetwork:boolean = true;
   userNetworksUUIDs:string[] = [];


   constructor(
      private dbService:DatabaseService
   ) { }


   public async getNetworksRecords(networksUUIDs:string[], pageNumber:number, pageSize:number): Promise<ElectronicHealthRecord[]>
   {
      let records: ElectronicHealthRecord[] = [];
      let recordsCount: number = 0; // Stores the amount of records found and added to the array while going through the networks records
      let offset = (pageNumber*pageSize) - pageSize;

      // Go through each user network
      networksLoop:
         for (let networkUUID of networksUUIDs) {

         // Get the connection of the network
         let networkDb = this.dbService.getNetworkDbConnection(networkUUID);

         // Get the number of blocks(records) in this network's chain
         const blocksCount = await networkDb.getRepository(Block).count();

         let fetchAmount:number = 0;

         if (pageSize < blocksCount) {
            // If there is more blocks than needed, get the needed amount
            fetchAmount = pageSize;
         } else {
            // If there is less blocks than needed, get the available amount
            fetchAmount = blocksCount;
         }

         // Go through the network's blocks and add records to the array
         // First block is the genesis block with blank medical record, so index starts at 2
         for (let i=2; i<=fetchAmount; i++) {

            /* 
               If counter reached offset then clear the counter and array, and start adding values from now on
               So if pageNumber=3 and pageSize=5, then offset=10, and it will add records found after the 10th 
               iteration. This mechanism basically allows pagination since TypeORM skip and take couldn't be 
               used in this case because records are being fetched from multiple databases/files/connections.
            */ 
           
            if (recordsCount == offset) {
               recordsCount = 0;
               records = [];
            }

            // Check if currently added records are match the needed amount
            if (recordsCount == pageSize) {
               // We're done here
               break networksLoop;
            }

            // Get medical records
            let record: MedicalRecord[] = await networkDb.getRepository(MedicalRecord).find({
               where: {id: i}, 
               relations: ["patientData", "conditions", "allergies", "history"]
            });

            // Get blocks
            let block: Block[] = await networkDb.getRepository(Block).find({
               where: {id: i}
            });
   
            // The medical record
            let recordData:HealthRecordData = record[0];

            // Construct a BlockInfo using fields acquired from the block of the medical record
            let blockInfo: BlockInfo = {
               index: block[0].index,
               timeStamp: block[0].timeStamp,
               networkUUID: block[0].networkUUID,
               senderAddress: block[0].senderAddress,
               recipientAddress: block[0].recipientAddress
            };
   
            // Construct an EHR object
            let ehr: ElectronicHealthRecord = {
               blockInfo: blockInfo,
               recordData: recordData
            }

            if (ehr) {
               records.push(ehr);
               recordsCount++;
            }
   
         }
         

      }

      return records;
   }
   
}
