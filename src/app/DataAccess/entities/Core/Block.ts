import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { MedicalRecord } from '../EHR/MedicalRecord';


@Entity()
export class Block
{
   // Block Header Contents

   @PrimaryGeneratedColumn()
   index:number;

   @Column()
   hash:string;

   @Column()
   previousHash:string;

   @Column()
   timeStamp:string;

   @Column()
   merkleLeafHash:string;

   @Column()
   networkUUID:string;

   // Transaction Contents

   @Column()
   transactionId:string;

   @Column()
   senderPubKey:string;

   @Column()
   senderAddress:string;

   @Column()
   recipientAddress:string;

   @Column()
   signature:string;

   @OneToOne(type => MedicalRecord, {cascade:true})
   @JoinColumn()
   medicalRecord: MedicalRecord;
}
