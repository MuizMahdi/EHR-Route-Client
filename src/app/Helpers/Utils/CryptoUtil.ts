import * as crypto from 'crypto';


export class CryptoUtil
{
   public static SHA256_Base64(val:string): string {
      const hash = crypto.createHash('sha256');
      return hash.update(val).digest('base64');
   }
}
