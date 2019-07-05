import { MedicalRecordResponse } from './MedicalRecordResponse';

export interface TransactionResponse
{
   transactionId: string;
   record: MedicalRecordResponse;
   senderAddress: string;
   recipientAddress: string;
   signature: string;
}
