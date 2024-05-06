import 'reflect-metadata';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Game } from "./game.entity";
import { User } from "./users.entity";
import { Assessment } from "./assessment.entity";
import { BaseEntity } from "./base.entity";
import { Candidate } from "./candidate.entity";
import { AnswerQuestionLogical } from "./answerQuestionLogical.entity";
import { AnswerLevelMemory } from "./AnswerLevelMemory.entity";
import { StatusGameResultEnum } from "src/common/enum/statusgame.enum";

@Entity({ name: "gameResult" })
export class GameResult extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    time_remain: number;

    @Column()
    time_start: Date;

    @Column({default:StatusGameResultEnum.PLAY})
    status: StatusGameResultEnum;
    
    @Column({default:0})
    score: number;

    @ManyToOne(() => Candidate, (Candidate) => Candidate.gameResult)
    candidate: Candidate

    @ManyToOne(() => Assessment, (Assessment) => Assessment.gameResult)
    assessment: Assessment

    @ManyToOne(() => Game, (Game) => Game.gameResult)
    game: Game

    @OneToMany(()=>AnswerQuestionLogical,AnswerQuestionLogical=>AnswerQuestionLogical.gameResult)
    answerQuestionLogical: AnswerQuestionLogical[]

    @ManyToOne(() => User, (User) => User.gameResult)
    hr: User

    @OneToMany(()=>AnswerLevelMemory,AnswerLevelMemory=>AnswerLevelMemory.gameResult)
    answerLevelMemory: AnswerLevelMemory[]
}