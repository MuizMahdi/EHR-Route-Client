import { Entity, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn } from "typeorm";
import { EhrHistory } from "./EhrHistory";
import { EhrCondition } from "./EhrCondition";
import { EhrAllergyAndReaction } from "./EhrAllergyAndReaction";
import { EhrPatientInfo } from "./EhrPatientInfo";


@Entity()
export class MedicalRecord
{
   @PrimaryGeneratedColumn()
   id: number;

   @OneToMany(type => EhrHistory, history => history.medicalRecord, {cascade:true, eager:true})
   history: EhrHistory[];

   @OneToMany(type => EhrCondition, condition => condition.medicalRecord, {cascade:true, eager:true})
   conditions: EhrCondition[];

   @OneToMany(type => EhrAllergyAndReaction, allergy => allergy.medicalRecord, {cascade:true, eager:true})
   allergies: EhrAllergyAndReaction[];

   @OneToOne(type => EhrPatientInfo, {cascade:true, eager:true})
   @JoinColumn()
   patientData: EhrPatientInfo;
}
