import 'reflect-metadata';
import { GametypeEnum } from "src/common/enum/gametype.enum";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Assessment_Game } from "./assessment_game.entity";
import { GameResult } from "./gameresult.entity";
import { QuestionLogical } from "./questionLogical.entity";
import { BaseEntity } from "./base.entity";
import { Hr_Game } from "./hr_game.entity";

@Entity({ name: "games" })
export class Game extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    game_type: GametypeEnum;

    @Column()
    description: string

    @Column()
    total_time: number

    @Column()
    total_question: number

    @OneToMany(() =>Assessment_Game , assessment_Game => assessment_Game.game)
    assessment_game: Assessment_Game[];

    @OneToMany(() =>Hr_Game , Hr_Game => Hr_Game.game)
    hr_game: Hr_Game[];

    @OneToMany(() =>QuestionLogical , QuestionLogical => QuestionLogical.game)
    questionLogical: QuestionLogical[];

    @OneToMany(() =>GameResult , GameResult => GameResult.game)
    gameResult: GameResult[];

}