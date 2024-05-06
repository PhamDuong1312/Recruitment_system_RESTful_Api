import 'reflect-metadata';
import { Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Candidate_Assessment } from "./candidate_assessment.entity";
import { Assessment_Game } from "./assessment_game.entity";
import { User } from "./users.entity";
import { GameResult } from "./gameresult.entity";

@Entity({ name: "assessment"})
export class Assessment extends BaseEntity{
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column()
  name: string;

  @Column()
  startDate: Date;
  
  @Column()
  endDate: Date;

  @Column({ default: false })
  archived: boolean;


  @ManyToOne(() => User, (User) => User.assesments)
  user: User

  @OneToMany(() => Candidate_Assessment, Candidate_Assessment => Candidate_Assessment.assessment)
  candidates: Candidate_Assessment[];
  
  @OneToMany(() =>Assessment_Game , assessment_Game => assessment_Game.assessment)
  assessment_game: Assessment_Game[];

  @OneToMany(() =>GameResult , GameResult => GameResult.assessment)
  gameResult: GameResult[];

}
