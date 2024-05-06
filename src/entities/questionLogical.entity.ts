import 'reflect-metadata';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Game } from "./game.entity";
import { AnswerQuestionLogical } from "./answerQuestionLogical.entity";

@Entity({name:"question_Logical"})
export class QuestionLogical extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;
    @Column({default:"Does the conclusion logically follow the statements?"})
    question:string

    @Column()
    statement1:string
    
    @Column()
    statement2:string
    
    @Column()
    conclusion:string
    
    @Column()
    correct:boolean

    @Column({default:1})
    point:number

    @ManyToOne(() => Game, (Game) => Game.questionLogical)
    game: Game

    @OneToMany(()=>AnswerQuestionLogical,AnswerQuestionLogical=>AnswerQuestionLogical.questionLogical)
    answerQuestionLogical:AnswerQuestionLogical[]
}