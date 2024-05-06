import 'reflect-metadata';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "./base.entity";
import { GameResult } from "./gameresult.entity";

@Entity({name:"answer_level_memory"})
export class AnswerLevelMemory extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    level: number

    @Column()
    appear_time: number

    @Column()
    res_time: number

    @Column({default:0})
    point: number

    @Column()
    pattern:string;

    @Column()
    answer:string;

    @Column({default:false})
    is_correct: boolean;

    @Column({default:false})
    status:boolean;

    @ManyToOne(() => GameResult, (GameResult) => GameResult.answerLevelMemory)
    gameResult: GameResult
}