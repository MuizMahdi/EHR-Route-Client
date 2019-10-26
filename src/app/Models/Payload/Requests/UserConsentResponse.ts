import { BlockResponse } from '../Responses/BlockResponse';


export interface UserConsentResponse 
{
   block: BlockResponse;
   medicalHistory: any;
   userPrivateKey: string;
   userAddress: string;
   consentRequestUUID: string;
   providerUUID: string;
   networkUUID: string;
   userID: number;
}