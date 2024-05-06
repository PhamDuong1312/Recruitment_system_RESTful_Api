import { Module, forwardRef } from "@nestjs/common";
import { gameService } from "./game.service";
import { GamesController } from "./game.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Game } from "src/entities/game.entity";
import { Assessment_Game } from "src/entities/assessment_game.entity";
import { Hr_Game } from "src/entities/hr_game.entity";
import { Assessment } from "src/entities/assessment.entity";
import { Candidate_Assessment } from "src/entities/candidate_assessment.entity";
import { UsersModule } from "../user/users.module";
import { Candidate } from "src/entities/candidate.entity";
import { QuestionLogicalModule } from "../questionlogical/questionlogical.module";
import { AnswerLevelMemoryModule } from "../levelmemory/levelmemory.module";
import { GameResultModule } from "../gameresult/gameresult.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Game,Assessment_Game,Hr_Game,Assessment,Candidate_Assessment,Candidate]),
        forwardRef(() => UsersModule),
        forwardRef(() => QuestionLogicalModule),
        forwardRef(() => AnswerLevelMemoryModule),
        forwardRef(() => GameResultModule),

    ],
    controllers:[GamesController],
    providers: [gameService],
    exports: [gameService]
})
export class GameModule {}