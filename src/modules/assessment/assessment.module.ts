import { Module } from "@nestjs/common";
import { AssessmentController } from "./assessment.controller";
import { AssessmentService } from "./assessment.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Assessment } from "src/entities/assessment.entity";
import { UsersModule } from "../user/users.module";
import { Game } from "src/entities/game.entity";
import { Assessment_Game } from "src/entities/assessment_game.entity";
import { GameModule } from "../game/game.module";
import { Candidate } from "src/entities/candidate.entity";
import { Candidate_Assessment } from "src/entities/candidate_assessment.entity";
import { GameResult } from "src/entities/gameresult.entity";

@Module({
    imports:[TypeOrmModule.forFeature([Assessment,Game,Assessment_Game,Candidate,Candidate_Assessment,GameResult]),
    UsersModule,
    GameModule],
    controllers:[AssessmentController],
    providers:[AssessmentService]
})
export class AssessmentModule {}