import { BlockAdditionResponse } from './../Payload/Responses/BlockAdditionResponse';


export interface BlockFetchResponse {
   blockResponse: BlockAdditionResponse;
   consumerUUID: string;
   networkUUID: string;
   networkChainRoot: string;
   networkLatestBlockIndex: number;
}
