import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { RoleEnum } from "src/common/enum/role.enum";
import { Assessment } from "src/entities/assessment.entity";
import { Assessment_Game } from "src/entities/assessment_game.entity";
import { Candidate_Assessment } from "src/entities/candidate_assessment.entity";
import { Game } from "src/entities/game.entity";
import { Hr_Game } from "src/entities/hr_game.entity";
import { Repository } from "typeorm";
import { CreateGameDto } from "./dto/createGame.dto";
import { GametypeEnum } from "src/common/enum/gametype.enum";
import { checkPlayer } from "src/ultils";
import { QuestionLogicalService } from "../questionlogical/questionlogical.service";
import { AnswerLevelMemoryService } from "../levelmemory/levelmemory.service";
import { UserService } from "../user/service/user.service";
import { GameResultService } from "../gameresult/gameresult.service";

@Injectable()
export class gameService {

    constructor(@InjectRepository(Game) private gameRepository: Repository<Game>,
        @InjectRepository(Hr_Game) private hrGameRepository: Repository<Hr_Game>,
        @InjectRepository(Assessment_Game) private assessmentGameRepository: Repository<Assessment_Game>,
        @InjectRepository(Assessment) private assessmentRepository: Repository<Assessment>,
        @InjectRepository(Candidate_Assessment) private candidateAssessmentRepository: Repository<Candidate_Assessment>,
        private questionLogicalService: QuestionLogicalService,
        private LevelMemoryService: AnswerLevelMemoryService,
        private UserService: UserService,
        private gameResultService: GameResultService,
    ) { }


    async getAllGames() {
        return await this.gameRepository.find()
    }
    async getDetailGame(id: number) {
        const game = await this.gameRepository.findOneBy({ id });
        if (!game)
            throw new NotFoundException("Game không tồn tại!")
        return game
    }

    async createGame(gameDto: CreateGameDto) {
        const game = await this.gameRepository.findOne({
            where: {
                game_type: gameDto.game_type
            }
        })
        if (game)
            throw new BadRequestException("game đã tồn tại")
        return await this.gameRepository.save(gameDto)
    }

    async getGameByAssessment(id: number, user) {
        const data = (await this.assessmentGameRepository.find({
            where: { assessment: { id } },
            relations: { game: true },
        })).map((item) => item.game)
        if (user.role === RoleEnum.ADMIN)
            return data
        if (user.role === RoleEnum.HR) {
            if (!(await this.assessmentRepository.findOne({ where: { id, user: { id: user.id } } }))) {
                throw new ForbiddenException("Không phải Assessment bạn tạo!")
            }
            return data
        }
        if (!(await this.candidateAssessmentRepository.findOne({ where: { assessment: { id }, candidate: { id: user.id } } })))
            throw new ForbiddenException("Bạn không được mời vào Assessment này!")
        return data
    }
    async getGameByHr(id: number, hrid: number) {
        const data = (await this.hrGameRepository.find({ where: { user: { id } }, relations: { game: true } }))
            .map((item) => item.game)
        if (hrid !== id)
            throw new UnauthorizedException("Không phải bạn!");
        return data
    }

    async hrPlayGame(gid: number, uid: number) {
        const hrGame = await this.hrGameRepository.findOne({
            where: {
                game: { id: gid },
                user: { id: uid }
            },
            relations: { game: true }
        })
        if (!hrGame)
            throw new NotFoundException("Bạn không được tiếp cận với game này!");
        if (hrGame.game.game_type === GametypeEnum.LOGICAL) {
            return await this.questionLogicalService.hrPlayLogical(uid, hrGame.game)
        }
        if (hrGame.game.game_type === GametypeEnum.MEMORY) {
            return await this.LevelMemoryService.hrPlayMemory(uid, hrGame.game)
        }
    }

    async playGame(id: number, user: any) {
        if (!checkPlayer(user)) {
            return this.hrPlayGame(id, user.id)
        }
        //check xem game có trong assement này không
        await this.UserService.findAndCheckAssessmentValid({id:user.assessmentId})
        const assessmentGame = await this.assessmentGameRepository.findOne({
            where: {
                game: { id: id },
                assessment: { id: user.assessmentId }
            },
            relations: { game: true, assessment: true }
        });
        if (!assessmentGame)
            throw new NotFoundException("Game does not exist in assessment");
        //check xem game type có pải logical?
        if (assessmentGame.game.game_type === GametypeEnum.LOGICAL) {
            return await this.questionLogicalService.playLogical(user, assessmentGame.game)
        }
        if (assessmentGame.game.game_type === GametypeEnum.MEMORY) {
            return await this.LevelMemoryService.playMemory(user, assessmentGame.game)
        }
    }

    async exitGame(id: number, user: any) {
        if (!checkPlayer(user)) {
            const gameResultHr = await this.gameResultService.findAndCheckGameHrValid(id, user.id);
            if (gameResultHr.game.game_type === GametypeEnum.LOGICAL) {
                return this.questionLogicalService.exitLogical(gameResultHr, user)
            }
            if (gameResultHr.game.game_type === GametypeEnum.MEMORY) {
                return this.LevelMemoryService.exitMemory(gameResultHr, user)
            }
        }
        await this.UserService.findAndCheckAssessmentValid({id:user.assessmentId})
        const gameResult = await this.gameResultService.findAndCheckGameValid(id, user.id, user.assessmentId)
        if (gameResult.game.game_type === GametypeEnum.LOGICAL) {
            return this.questionLogicalService.exitLogical(gameResult, user)
        }
        if (gameResult.game.game_type === GametypeEnum.MEMORY) {
            return this.LevelMemoryService.exitMemory(gameResult, user)
        }
    }

    async skipQuestion(id: number, qid: number, user: any) {
        if (!checkPlayer(user)) {
            const gameResultHr = await this.gameResultService.findAndCheckGameHrValid(id, user.id);
            if (gameResultHr.game.game_type !== GametypeEnum.LOGICAL) {
                throw new BadRequestException("Chỉ game Logical mới có thể bỏ qua câu hỏi!")
            }
            return this.questionLogicalService.skipQuestion(qid, gameResultHr, user)
        }
        await this.UserService.findAndCheckAssessmentValid({id:user.assessmentId})
        const gameResult = await this.gameResultService.findAndCheckGameValid(id, user.id, user.assessmentId)
        if (gameResult.game.game_type !== GametypeEnum.LOGICAL) {
            throw new BadRequestException("Chỉ game Logical mới có thể bỏ qua câu hỏi!")
        }
        return this.questionLogicalService.skipQuestion(qid, gameResult, user)
    }

    async endGame(id: number, user: any) {
        if (!checkPlayer(user)) {
            const gameResultHr = await this.gameResultService.findAndCheckGameHrValid(id, user.id);
            return this.UserService.EndGame(user, gameResultHr)
        }
        await this.UserService.findAndCheckAssessmentValid({id:user.assessmentId})
        const gameResult = await this.gameResultService.findAndCheckGameValid(id, user.id, user.assessmentId)
        return this.UserService.EndGame(user, gameResult)
    }
}