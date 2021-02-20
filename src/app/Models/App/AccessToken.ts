export interface AccessToken {
   sub: number;
   address: string;
   roles: string[];
   email: string;
   firstLogin: boolean;
   hasAddedInfo: boolean;
}
