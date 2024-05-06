import 'reflect-metadata';
import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Assessment } from "./assessment.entity";
import { Game } from "./game.entity";
import { BaseEntity } from "./base.entity";

@Entity({ name: "assessment_game" })
export class Assessment_Game extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @ManyToOne(() => Assessment, (assessment) => assessment.assessment_game)
    assessment: Assessment

    @ManyToOne(() => Game, (game) => game.assessment_game)
    game: Game

}