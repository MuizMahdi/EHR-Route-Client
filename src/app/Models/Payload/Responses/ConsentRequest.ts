import { BlockResponse } from './BlockResponse';

export interface ConsentRequest
{
   block: BlockResponse;
   consentRequestUUID: string;
   networkUUID: string;
   providerUUID: string;
   userID: number;
}