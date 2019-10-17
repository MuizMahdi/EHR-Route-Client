import { NzMessageService } from "ng-zorro-antd";
import { InjectorInstance } from './../../app.module';

export default class AppUtil
{
   constructor() {}

   public static createMessage(type: "success" | "error" | "warning", message: string): void {
      let nzMessageService = InjectorInstance.get<NzMessageService>(NzMessageService);
      nzMessageService.create(type, message);
   }
}