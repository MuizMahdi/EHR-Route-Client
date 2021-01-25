import { MedicalRecordResponse } from './MedicalRecordResponse';
import { ConsentRequest } from './ConsentRequest';


export interface UpdateConsentRequest
{
   ehrDetailsUuid: string;
   userConsentRequest: ConsentRequest;
   updateMedicalRecord: MedicalRecordResponse;
}
