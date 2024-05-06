import { Module, forwardRef } from "@nestjs/common";
import { AnswerLevelMemoryController } from "./levelmemory.controller";
import { AnswerLevelMemoryService } from "./levelmemory.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AnswerLevelMemory } from "src/entities/AnswerLevelMemory.entity";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { UsersModule } from "../user/users.module";
import { Candidate } from "src/entities/candidate.entity";
import { GameResult } from "src/entities/gameresult.entity";
import { GameResultModule } from "../gameresult/gameresult.module";

@Module({
    imports: [TypeOrmModule.forFeature([AnswerLevelMemory,Candidate,GameResult,
    ]),JwtModule,
    forwardRef(() => UsersModule),
    forwardRef(() => GameResultModule)
],
    controllers:[AnswerLevelMemoryController],
    providers:[AnswerLevelMemoryService,JwtService],
    exports:[AnswerLevelMemoryService],
})
export class AnswerLevelMemoryModule {}