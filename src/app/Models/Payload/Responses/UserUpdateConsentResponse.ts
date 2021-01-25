import { UserConsentResponse } from './../Requests/UserConsentResponse';


export interface UserUpdateConsentResponse
{
   ehrDetailsUuid: string;
   consentResponse: UserConsentResponse;
}
