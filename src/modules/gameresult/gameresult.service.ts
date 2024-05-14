import { BadRequestException, Injectable, MethodNotAllowedException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { RoleEnum } from "src/common/enum/role.enum";
import { StatusGameResultEnum } from "src/common/enum/statusgame.enum";
import { Assessment } from "src/entities/assessment.entity";
import { Assessment_Game } from "src/entities/assessment_game.entity";
import { Game } from "src/entities/game.entity";
import { GameResult } from "src/entities/gameresult.entity";
import { Hr_Game } from "src/entities/hr_game.entity";
import { checkCandidate, checkPlayer } from "src/ultils";
import { Repository } from "typeorm";

@Injectable()
export class GameResultService {
    constructor(
        @InjectRepository(GameResult) private gameResultRepository: Repository<GameResult>,
        @InjectRepository(Game) private gameRepository: Repository<Game>,
        @InjectRepository(Assessment) private AssessmentRepository: Repository<Assessment>,
        @InjectRepository(Assessment_Game) private assessmentGameRepository: Repository<Assessment_Game>,
        @InjectRepository(Hr_Game) private hrGameRepository: Repository<Hr_Game>,

    ) { }

    getAllResults() {
        return this.gameResultRepository.find({
            relations: {
                game: true,
                candidate: true,
                assessment: true,
                hr:true,
            }
        })
    }


    async getResultsCurrent(user) {
        if (!checkPlayer(user))
            return this.gameResultRepository.find({
                where: {
                    hr: { id: user.id },
                },
                relations: {
                    game: true
                }
            })
        return this.gameResultRepository.find({
            where: {
                candidate: { id: user.id },
                assessment: { id: user.assessmentId }
            },
            relations: {
                game: true
            }
        })
    }

    async getResultByAssessment(id: number, user) {
        const assessment = await this.AssessmentRepository.findOne({ where: { id: id }, relations: { user: true } })
        if (!assessment)
            throw new NotFoundException("assessment does not exist")
        const data = await this.gameResultRepository.find({
            where: { assessment: { id } },
            relations: {
                game:true,
                candidate:true
            }
        })
        if (user.role === RoleEnum.ADMIN)
            return data
        if (assessment.user.id !== user.id)
            throw new MethodNotAllowedException()
        return data
    }

    async getResult(id: number, user) {
        const gameresult = await this.gameResultRepository.findOne({
            where: { id },
            relations: {
                game: true,
                assessment: true,
                candidate: true,
                hr: true,
                // answerLevelMemory:true,
                // answerQuestionLogical:true
            }
        })
        if (!gameresult)
            throw new NotFoundException()
        return gameresult
    }

    async getDetailResultCurrent(id: number, user: any) {
        if(!checkPlayer(user)){
            const gameresultHr = await this.gameResultRepository.findOne({
                where: {
                    game:{id},
                    hr:{id:user.id},
                },
            })
            if(!gameresultHr){
                throw new BadRequestException("Game chưa bắt đầu")
            }
            if(gameresultHr.status!==StatusGameResultEnum.FINISH){
                throw new BadRequestException("Game chưa kết thúc")
            }
            return gameresultHr
        }
        const gameresult = await this.gameResultRepository.findOne({
            where: {
                game:{id},
                candidate:{id:user.id},
                assessment:{id:user.assessmentId}
            },
        })
        if(!gameresult){
            throw new BadRequestException("Game chưa bắt đầu")
        }
        if(gameresult.status!==StatusGameResultEnum.FINISH){
            throw new BadRequestException("Game chưa kết thúc")
        }
        return gameresult
    }

    async findAndCheckGameValid(gid: number, uid: number, aid: number) {
        const assessment_game = await this.assessmentGameRepository.findOne({
            where: {
                assessment: { id: aid },
                game: { id: gid }
            }
        })
        if (!assessment_game) {
            throw new NotFoundException("Game không tồn tại trong Assessment")
        }
        const gameResult = await this.gameResultRepository.findOne({
            where: {
                candidate: { id: uid },
                assessment: { id: aid },
                game: { id: gid }
            },
            relations: { game: true, candidate: true, assessment: true }
        })
        if (!gameResult) {
            throw new NotFoundException("Game chưa được bắt đầu")
        }
        if (gameResult.status === StatusGameResultEnum.PAUSE) {
            throw new BadRequestException("Game đang tạm dừng")
        }
        if (gameResult.status === StatusGameResultEnum.FINISH) {
            throw new BadRequestException("Game đã kết thúc")
        }
        return gameResult
    }

    async findAndCheckGameHrValid(gid: number, uid: number) {
        const hrgame = await this.hrGameRepository.findOne({
            where: {
                user: { id: uid },
                game: { id: gid }
            }
        })
        if (!hrgame) {
            throw new NotFoundException("Bạn không được tiếp cận với game này!")
        }
        const gameResult = await this.gameResultRepository.findOne({
            where: {
                hr: { id: uid },
                game: { id: gid }
            },
            relations: { game: true, candidate: true, assessment: true }
        })
        if (!gameResult) {
            throw new NotFoundException("Game chưa được bắt đầu")
        }
        if (gameResult.status === StatusGameResultEnum.PAUSE) {
            throw new BadRequestException("Game đang tạm dừng")
        }
        if (gameResult.status === StatusGameResultEnum.FINISH) {
            throw new BadRequestException("Game đã kết thúc")
        }
        return gameResult
    }

}
