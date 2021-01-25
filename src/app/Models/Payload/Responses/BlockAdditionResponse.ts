import { BlockMetadata } from './BlockMetadata';
import { BlockResponse } from './BlockResponse';


export interface BlockAdditionResponse
{
   block: BlockResponse;
   metadata: BlockMetadata;
}