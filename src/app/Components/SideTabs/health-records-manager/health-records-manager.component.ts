import { ElectronicHealthRecord } from './../../../Models/App/ElectronicHealthRecord';
import { RecordDetailsComponent } from './../../Modals/record-details/record-details.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ChainService } from './../../../Services/chain.service';
import { HealthRecordData } from '../../../Models/App/HealthRecordData';
import { NodeNetworkService } from '../../../Services/node-network.service';
import { EhrService } from './../../../Services/ehr.service';
import { Component, OnInit } from '@angular/core';
import { MainLayoutService } from '../../../Services/main-layout.service';
import { UserNetworks } from '../../../Models/Payload/Responses/UserNetworks';


@Component({
  selector: 'app-health-records-manager',
  templateUrl: './health-records-manager.component.html',
  styleUrls: ['./health-records-manager.component.css']
})


export class HealthRecordsManagerComponent implements OnInit 
{
   //#region States

   pageSize: number = 8;
   pageNumber: number = 1;
   totalPagesNumber: number;
   records: ElectronicHealthRecord[] = [];
   userNetworksUUIDs: string[] = [];
   userHasNetworks: boolean = false;

   state = {};

   uiState = {
      isLoading: false,
   };

   //#endregion


   constructor (
      public mainLayout: MainLayoutService, 
      private ehrService: EhrService,
      private networkService: NodeNetworkService, 
      private chainService: ChainService,
      private modalService: NzModalService
   ) { }


   /* -------------------------------------------------------------------------- */
   /*                               Initialization                               */
   /* -------------------------------------------------------------------------- */
   //#region 

   async ngOnInit() {

      // Display main layout
      this.mainLayout.show();

      // Get user networks UUIDs
      await this.getUserNetworksUUIDs();

   }


   private async getUserNetworksUUIDs() {

      console.log('[HealthRecordsManager Component] Getting user networks...');

      // Display loader
      this.uiState.isLoading = true;

      this.networkService.getUserNetworks().subscribe(
         
         async (res: UserNetworks) => {
         
            // Set user networks UUIDs list
            this.userNetworksUUIDs = res.userNetworks.map(n => n.networkUUID);

            if (this.userNetworksUUIDs.length > 0) {

               this.userHasNetworks = true;

               console.log('User has networks!');

               // Get the count of all the available records to setup the number of pages
               await this.chainService.countAllNetworksBlocks(this.userNetworksUUIDs).then(count => {
                  this.totalPagesNumber = Math.ceil(count / this.pageSize) * 10;
               });

               // Then get the medical records
               this.getRecords();

            }

         },
         (err) => {
            console.log('Error', err);
            this.userHasNetworks = false;
            this.uiState.isLoading = false;
         }
      
      );
      
      /* await this.networkService.getUserNetworksUUIDs().then(async networksUUIDs => {

         if (networksUUIDs.length > 0) this.userHasNetworks = true;

         this.userNetworksUUIDs = networksUUIDs;

         // Get the count of all the available records to setup the number of pages
         await this.chainService.countAllNetworksBlocks(networksUUIDs).then(count => {
            this.totalPagesNumber = Math.ceil(count / this.pageSize) * 10;
         });

         // Conceal loader
         this.uiState.isLoading = false;


      }).catch(error => {
         console.log('Error', error);
         this.userHasNetworks = false;
         this.uiState.isLoading = false;
      }); */

   }


   private getRecords(): void {
      if (this.userHasNetworks) {
         this.ehrService.getNetworksRecords(this.userNetworksUUIDs, this.pageNumber, this.pageSize).then(records => {
            
            this.records = records;

            // Conceal loader
            this.uiState.isLoading = false;

         });
      }
   }

   //#endregion


   /* -------------------------------------------------------------------------- */
   /*                               User Interface                               */
   /* -------------------------------------------------------------------------- */
   //#region 

   changePageNumber(pageNumber:number): void {
      this.pageNumber = pageNumber;
      this.getRecords();
   }


   changePageSize(pageSize:number): void {
      this.pageSize = pageSize;
      this.getRecords();
   }


   viewRecordDetails(record:ElectronicHealthRecord): void {

      let patientName:string = record.recordData.patientData.name;

      const recordDetailsModal = this.modalService.create({

         nzTitle: patientName + "'s EHR",

         nzContent: RecordDetailsComponent,

         // Pass the parameter to the component as an input
         nzComponentParams: {
            EHR: record
         },

         nzFooter: null,

         nzWidth: '60vw'

      });

      // delay until modal instance created
      window.setTimeout(() => {
        const instance = recordDetailsModal.getContentComponent();
      }, 1000);

   }

   //#endregion


   
}
