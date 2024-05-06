import { Module, forwardRef } from "@nestjs/common";
import { QuestionLogicalController } from "./questionlogical.controller";
import { QuestionLogicalService } from "./questionlogical.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GameResult } from "src/entities/gameresult.entity";
import { QuestionLogical } from "src/entities/questionLogical.entity";
import { AnswerQuestionLogical } from "src/entities/answerQuestionLogical.entity";
import { Game } from "src/entities/game.entity";
import { Candidate } from "src/entities/candidate.entity";
import { UsersModule } from "../user/users.module";
import { GameResultModule } from "../gameresult/gameresult.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([GameResult,QuestionLogical,AnswerQuestionLogical,Game,Candidate,]),
        forwardRef(() => UsersModule),
        forwardRef(() => GameResultModule),

    ],
    controllers:[QuestionLogicalController],
    providers: [QuestionLogicalService],
    exports:[QuestionLogicalService]
})
export class QuestionLogicalModule {}