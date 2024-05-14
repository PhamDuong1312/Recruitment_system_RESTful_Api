import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GametypeEnum } from '@src/common/enum/gametype.enum';
import { StatusGameResultEnum } from '@src/common/enum/statusgame.enum';
import { GameResult } from '@src/entities/gameresult.entity';
import { timeRemainValid } from '@src/ultils';
import * as cron from 'node-cron';
import { Repository } from 'typeorm';
import { UserService } from '../user/service/user.service';
import { AnswerLevelMemory } from '@src/entities/AnswerLevelMemory.entity';

@Injectable()
export class ScheduledService {
    constructor(
        @InjectRepository(AnswerLevelMemory) private answerLevelMemoryRepository:Repository<AnswerLevelMemory>,
        @InjectRepository(GameResult) private gameResultRepository: Repository<GameResult>,
        private UserService: UserService
    ) {
        this.scheduleTask();
    }
    async checkGameLogicalFinish(gameResult: GameResult){
        const time_remain = Math.ceil(timeRemainValid(gameResult.time_remain, gameResult.time_start))
        if (time_remain <= 0) {
            await this.gameResultRepository.update({ id: gameResult.id }, { status: StatusGameResultEnum.FINISH, time_remain: 0 })
            if(!gameResult.hr){
                await this.UserService.changeStatusCandidateAssessment({
                    ...gameResult.candidate,assessmentId: gameResult.assessment.id
                })
            }
            
        }
    }
    async checkGameMemoryFinish(gameResult: GameResult){
        const levelIngame=await this.answerLevelMemoryRepository.findOneBy({status:false,gameResult:{id:gameResult.id}}) 
        const time_remain = Math.ceil(timeRemainValid(levelIngame.appear_time+levelIngame.res_time, gameResult.time_start))
        if (time_remain <= 0) {
            await this.gameResultRepository.update({ id: gameResult.id }, { status: StatusGameResultEnum.FINISH})
            if(!gameResult.hr){
                await this.UserService.changeStatusCandidateAssessment({
                    ...gameResult.candidate,assessmentId: gameResult.assessment.id
                })
            }
            
        }
    }

    private scheduleTask() {
        cron.schedule('*/5 * * * * *', async () => {
            const gameResults = await this.gameResultRepository.find({
                where: { status: StatusGameResultEnum.PLAY },
                relations: { game: true,hr:true,candidate:true,assessment:true }
            })
            await Promise.all(gameResults.map( async(gameResult) =>{
                if(gameResult.game.game_type===GametypeEnum.MEMORY){
                    await this.checkGameMemoryFinish(gameResult)
                }
                if(gameResult.game.game_type===GametypeEnum.LOGICAL){
                    await this.checkGameLogicalFinish(gameResult)
                }
                return null
            }))
        });
    }
}