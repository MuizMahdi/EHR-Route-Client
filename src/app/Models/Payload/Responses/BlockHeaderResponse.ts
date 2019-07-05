export interface BlockHeaderResponse
{
   hash: string;
   previousHash: string;
   timeStamp: number;
   index: number;
   merkleLeafHash: string;
   networkUUID: string;
}
