import 'reflect-metadata';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { GameResult } from "./gameresult.entity";
import { QuestionLogical } from "./questionLogical.entity";
import { BaseEntity } from "./base.entity";

@Entity({name:"answer_question_logical"})
export class AnswerQuestionLogical extends BaseEntity{
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    answer:boolean;

    @Column()
    index:number;

    @Column({default:0})
    point:number;

    @Column({default:false})
    is_correct:boolean;

    @Column({default:false})
    status:boolean;

    @ManyToOne(()=>GameResult,gameResult=>gameResult.answerQuestionLogical)
    gameResult:GameResult;

    @ManyToOne(()=>QuestionLogical,QuestionLogical=>QuestionLogical.answerQuestionLogical)
    questionLogical:QuestionLogical;
}