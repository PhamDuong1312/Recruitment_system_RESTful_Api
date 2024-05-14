import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from '../user/users.module';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AssessmentModule } from '../assessment/assessment.module';
import { AnswerLevelMemoryModule } from '../levelmemory/levelmemory.module';
import { QuestionLogicalModule } from '../questionlogical/questionlogical.module';
import { GameModule } from '../game/game.module';
import { GameResultModule } from '../gameresult/gameresult.module';
import databaseConfig from 'src/databases/config';
import { ScheduledService } from './Scheduled.service';
import { GameResult } from '@src/entities/gameresult.entity';
import { AnswerLevelMemory } from '@src/entities/AnswerLevelMemory.entity';

const options = databaseConfig as TypeOrmModuleOptions;
@Module({
  imports: [
    TypeOrmModule.forFeature([GameResult,AnswerLevelMemory]),
    TypeOrmModule.forRoot({
      ...options,
      autoLoadEntities:true
    }),
    UsersModule,
    AnswerLevelMemoryModule,
    QuestionLogicalModule,
    GameModule,
    GameResultModule,
    AuthModule,
    AssessmentModule
  ],
  controllers: [AppController],
  providers: [AppService,ScheduledService],
})
export class AppModule { }
