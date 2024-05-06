import 'reflect-metadata';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Assessment } from "./assessment.entity";
import { Candidate } from "./candidate.entity";

@Entity({ name: "candidate_assessment" })
export class Candidate_Assessment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  status: boolean;


  @ManyToOne(() => Candidate, (Candidate) => Candidate.assessments)
  candidate: Candidate

  @ManyToOne(() => Assessment, (assessment) => assessment.candidates)
  assessment: Assessment

}
