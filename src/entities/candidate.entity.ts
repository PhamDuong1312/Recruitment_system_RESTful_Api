import 'reflect-metadata';
import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Candidate_Assessment } from "./candidate_assessment.entity";
import { GameResult } from "./gameresult.entity";

@Entity({name:"candidate"})
export class Candidate extends BaseEntity{
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    @Index({ unique: true })
    email: string;

    @OneToMany(()=>Candidate_Assessment,Candidate_Assessment=>Candidate_Assessment.candidate)
    assessments:Candidate_Assessment[]

    @OneToMany(()=>GameResult,GameResult=>GameResult.candidate)
    gameResult:GameResult[]
}