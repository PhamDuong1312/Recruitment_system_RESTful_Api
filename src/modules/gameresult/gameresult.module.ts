import { Module, forwardRef } from "@nestjs/common";
import { GameResultsController } from "./gameresult.controller";
import { GameResultService } from "./gameresult.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GameResult } from "src/entities/gameresult.entity";
import { UsersModule } from "../user/users.module";
import { Candidate } from "src/entities/candidate.entity";
import { Game } from "src/entities/game.entity";
import { Assessment_Game } from "src/entities/assessment_game.entity";
import { Assessment } from "src/entities/assessment.entity";
import { Hr_Game } from "src/entities/hr_game.entity";

@Module({
    imports:[TypeOrmModule.forFeature([GameResult,Candidate,Game,Assessment_Game,Assessment,Hr_Game]),
    forwardRef(() => UsersModule)
    ],
    controllers:[GameResultsController],
    providers:[GameResultService],
    exports:[GameResultService],
})
export class GameResultModule {}