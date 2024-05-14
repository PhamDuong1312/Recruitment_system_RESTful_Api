import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { GametypeEnum } from "src/common/enum/gametype.enum";
import { Repository } from "typeorm";
import { checkPlayer, timeRemainValid } from "src/ultils";
import { GameResult } from "src/entities/gameresult.entity";
import { AnswerMemoryDto } from "./dto/answermemory.dto";
import { UserService } from "../user/service/user.service";
import { AnswerLevelMemory } from "src/entities/AnswerLevelMemory.entity";
import { StatusGameResultEnum } from "src/common/enum/statusgame.enum";
import { GameResultService } from "../gameresult/gameresult.service";
import { Game } from "src/entities/game.entity";

@Injectable()
export class AnswerLevelMemoryService {
    constructor(@InjectRepository(AnswerLevelMemory) private answerLevelMemoryRepository: Repository<AnswerLevelMemory>,
        @InjectRepository(GameResult) private gameResultRepository: Repository<GameResult>,
        private userService: UserService,
        private gameResultService: GameResultService
    ) {
    }
    //Candidate chơi game
    async playMemory(user: any, game: Game) {
        let gameresult = await this.gameResultRepository.findOne({
            where: {
                candidate: { id: user.id },
                game: { id:game.id },
                assessment: { id: user.assessmentId }
            }
        })
        if (!gameresult) {
            gameresult = await this.gameResultRepository.save({
                candidate: { id: user.id },
                game: game,
                time_start: new Date(),
                assessment: { id: user.assessmentId },
                time_remain: game.total_time
            })
        }
        if (gameresult.status === StatusGameResultEnum.FINISH)
            throw new BadRequestException("Game đã kết thúc")
        await this.answerLevelMemoryRepository.delete({status:false,gameResult:{id: gameresult.id}})
        let level = await this.answerLevelMemoryRepository.findOne({
            where: { gameResult: { id: gameresult.id }, status: false },
        });
        if (!level) {
            const levels = await this.answerLevelMemoryRepository.find({where:{gameResult:{id: gameresult.id}}});
            level = await this.createPattern(levels.length + 1, gameresult)
        }
        const data = {
            level: level.level,
            res_time: level.res_time,
            appear_time: level.appear_time,
            pattern: JSON.parse(level.pattern),
            point: level.point
        }
        this.gameResultRepository.update({ id: gameresult.id }, { time_start: new Date(), status: StatusGameResultEnum.PLAY })
        return {
            level: data,
            game: {
                gametype: game.game_type,
                score: gameresult.score,
                totalQuestions: game.total_question
            }
        }
    }
    //Tạo mới 1 pattern ngẫu nhiên theo level
    createPattern(level: number, gameResult: GameResult) {
        const patternSave = this.answerLevelMemoryRepository.create({
            level: level,
            res_time: level > 2 ? level : 3,
            appear_time: level,
            point: level,
            pattern: JSON.stringify(this.randomPatternMemory(level)),
            gameResult: gameResult
        })
        return this.answerLevelMemoryRepository.save(patternSave)
    }

    randomPatternMemory(level: number): string[] {
        const pattern: string[] = []
        for (let i = 0; i < level; i++) {
            const random = Math.round(Math.random())
            if (random) {
                pattern.push("right")
            } else {
                pattern.push("left")
            }
        }
        return pattern
    }

    async AnswerMemory(gid: number, lid: number, answerDto: AnswerMemoryDto, user: any) {
        if (!checkPlayer(user)){
            const gameResultHr = await this.gameResultService.findAndCheckGameHrValid(gid,user.id)
            return this.Answer(gameResultHr, answerDto,lid,user)
        }
        await this.userService.findAndCheckAssessmentValid({id:user.assessmentId})
        const gameResult = await this.gameResultService.findAndCheckGameValid(gid, user.id, user.assessmentId)
        return this.Answer(gameResult, answerDto,lid,user)
    }

    async Answer(gameResult: GameResult, answerDto: AnswerMemoryDto, lid: number, user: any){
        const levelInGame = (await this.answerLevelMemoryRepository.findOne({
            where: {
                gameResult: { id: gameResult.id },
                level: lid
            },
        }))
        if (!levelInGame) {
            throw new NotFoundException("Level không thuộc về bài thi")
        }
        if (levelInGame.status) {
            throw new BadRequestException("Bạn đã trả lời câu này")
        }
        const time_remain = Math.ceil(timeRemainValid(levelInGame.appear_time+levelInGame.res_time, gameResult.time_start))
        if (time_remain <= -10) {
            await this.gameResultRepository.update({ id: gameResult.id }, { status: StatusGameResultEnum.FINISH})
            this.userService.changeStatusCandidateAssessment(user)
            throw new BadRequestException("Thời gian trả lời đã kết thúc")
        }
        const pattern = JSON.parse(levelInGame.pattern)
        const is_correct= pattern.every((item,index) => item===answerDto.answer[index])
        const answerUpdate={
            status: true,
            is_correct,
            answer: JSON.stringify(answerDto.answer),
        }
        const gameResultUpdate = {
            status:!is_correct||levelInGame.level===gameResult.game.total_question?StatusGameResultEnum.FINISH:StatusGameResultEnum.PLAY,
            score:is_correct?levelInGame.point:gameResult.score,
            time_start:new Date()
        }
        await this.answerLevelMemoryRepository.update({id:levelInGame.id},answerUpdate)
        this.gameResultRepository.update({ id: gameResult.id }, gameResultUpdate)
        if (gameResultUpdate.status === StatusGameResultEnum.FINISH) {
            this.userService.changeStatusCandidateAssessment(user)
            return {
                result: answerUpdate.is_correct,
                level: {},
                game: {
                    gametype: gameResult.game.game_type,
                    score: gameResultUpdate.score,
                    totalQuestions: gameResult.game.total_question
                }, 
                message: "Chúc mừng bạn đã hoàn thành game"
            }
        }
        const nextlevel =await this.createPattern(levelInGame.level+1,gameResult)
        const data = {
            level: nextlevel.level,
            res_time: nextlevel.res_time,
            appear_time: nextlevel.appear_time,
            pattern: JSON.parse(nextlevel.pattern),
            point: nextlevel.point
        }
        return {
            result: answerUpdate.is_correct,
            level: data,
            game: {
                gametype: gameResult.game.game_type,
                score: gameResultUpdate.score,
                totalQuestions: gameResult.game.total_question
            }
        }
    }

    async exitMemory(gameResult: GameResult,user:any) {
        const levelIngame=await this.answerLevelMemoryRepository.findOneBy({status:false,gameResult:{id:gameResult.id}}) 
        const time_remain = Math.ceil(timeRemainValid(levelIngame.appear_time+levelIngame.res_time, gameResult.time_start))
        if (time_remain <= -10) {
            await this.gameResultRepository.update({ id: gameResult.id }, { status: StatusGameResultEnum.FINISH})
            this.userService.changeStatusCandidateAssessment(user)
            throw new BadRequestException("Thời gian chơi đã kết thúc")
        }
        this.answerLevelMemoryRepository.delete({status:false,gameResult:{id: gameResult.id}})
        return this.gameResultRepository.update({ id: gameResult.id }, { status: StatusGameResultEnum.PAUSE})
    }

    async hrPlayMemory(uid:number, game:Game){
        let gameresult = await this.gameResultRepository.findOne({
            where: {
                hr: { id: uid },
                game: { id:game.id },
            }
        })
        if (!gameresult) {
            gameresult = await this.gameResultRepository.save({
                game: game,
                hr: { id: uid },
                time_start: new Date(),
                time_remain: game.total_time
            })
        }
        if (gameresult.status === StatusGameResultEnum.FINISH)
            throw new BadRequestException("Game đã kết thúc")
        await this.answerLevelMemoryRepository.delete({status:false,gameResult:{id: gameresult.id}})
        let level = await this.answerLevelMemoryRepository.findOne({
            where: { gameResult: { id: gameresult.id }, status: false },
        });
        if (!level) {
            const levels = await this.answerLevelMemoryRepository.find({where:{gameResult:{id: gameresult.id}}});
            level = await this.createPattern(levels.length + 1, gameresult)
        }
        const data = {
            level: level.level,
            res_time: level.res_time,
            appear_time: level.appear_time,
            pattern: JSON.parse(level.pattern),
            point: level.point
        }
        this.gameResultRepository.update({ id: gameresult.id }, { time_start: new Date(), status: StatusGameResultEnum.PLAY })
        return {
            level: data,
            game: {
                gametype: game.game_type,
                score: gameresult.score,
                totalQuestions: game.total_question
            }
        }
    }
}