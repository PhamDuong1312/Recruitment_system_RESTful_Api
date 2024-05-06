import { Module, forwardRef } from '@nestjs/common';
import { UserAdminController } from './controllers/users.admin.controller';
import { UserCandidateController } from './controllers/users.candidate.controller';
import { UserHrController } from './controllers/users.hr.controller';
import { UserService } from './service/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/users.entity';
import { UsersRepository } from './repositories/user.repository';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Assessment } from 'src/entities/assessment.entity';
import { Candidate_Assessment } from 'src/entities/candidate_assessment.entity';
import { Game } from 'src/entities/game.entity';
import { GameResult } from 'src/entities/gameresult.entity';
import { Hr_Game } from 'src/entities/hr_game.entity';
import { Candidate } from 'src/entities/candidate.entity';
import { GameModule } from '../game/game.module';
import { Assessment_Game } from 'src/entities/assessment_game.entity';
import { QuestionLogical } from 'src/entities/questionLogical.entity';
import { AnswerQuestionLogical } from 'src/entities/answerQuestionLogical.entity';
import { MailService } from 'src/common/lib/mail/mail.lib';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Assessment, Candidate_Assessment, Game, GameResult,
            Hr_Game, Candidate, Assessment_Game, QuestionLogical, AnswerQuestionLogical]),
        forwardRef(() => GameModule)
    ],
    controllers: [UserAdminController, UserCandidateController, UserHrController],
    providers: [UserService, UsersRepository, MailService],
    exports: [UserService, UsersRepository]
})
export class UsersModule {}
