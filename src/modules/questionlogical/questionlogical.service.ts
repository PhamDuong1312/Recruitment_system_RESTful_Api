import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { GametypeEnum } from "src/common/enum/gametype.enum";
import { Game } from "src/entities/game.entity";
import { GameResult } from "src/entities/gameresult.entity";
import { QuestionLogical } from "src/entities/questionLogical.entity";
import { AnswerQuestionLogical } from "src/entities/answerQuestionLogical.entity";
import { checkPlayer, timeRemainValid } from "src/ultils";
import { MoreThan, Repository } from "typeorm";
import { CreateQuestionDto } from "./dto/createquestion.dto";
import { AnswerLogicalDto } from "../user/dto/answerQuestion.dto";
import { UserService } from "../user/service/user.service";
import { GameResultService } from "../gameresult/gameresult.service";
import { StatusGameResultEnum } from "src/common/enum/statusgame.enum";

@Injectable()
export class QuestionLogicalService {
    constructor(
        private UserService: UserService,
        private GameResultService: GameResultService,
        @InjectRepository(QuestionLogical) private questionLogicalRepository: Repository<QuestionLogical>,
        @InjectRepository(AnswerQuestionLogical) private answerQuestionRepository: Repository<AnswerQuestionLogical>,
        @InjectRepository(GameResult) private gameResultRepository: Repository<GameResult>,
        @InjectRepository(Game) private gameRepository: Repository<Game>,
        @InjectRepository(AnswerQuestionLogical) private answerQuestionLogicalRepository: Repository<AnswerQuestionLogical>
    ) {
    }

    async GetDetailQuestion(id: number) {
        const question = await this.questionLogicalRepository.findOneBy({ id })
        if (!question)
            throw new NotFoundException("Không tìm thấy câu hỏi")
        delete question.correct
        return { question }
    }

    async getAllQuestionsByGame(id: number) {
        const game = await this.gameRepository.findOneBy({ id });
        if (!game) throw new NotFoundException("game not found")
        if (game.game_type !== GametypeEnum.LOGICAL)
            throw new BadRequestException("game pải có type là logical")
        const data = await this.questionLogicalRepository.find({ where: { game: { id } } })
        return { data, total: data.length };
    }

    //lấy ra số câu hỏi ngẫu nhiên sao cho tối đa có 3 câu trùng đáp án
    // async randomQuestion(idgame: number, qty: number) {
    //     let questions = (await this.getAllQuestionsByGame(idgame)).data
    //     const arrRandom: number[] = []
    //     const questionRandom: QuestionLogical[] = []
    //     while (questionRandom.length < qty) {
    //         let status: boolean = null
    //         let count = 0
    //         const random = Math.round(Math.random() * (questions.length - 1))
    //         if (!arrRandom.includes(random)) {
    //             questionRandom.forEach(item => {
    //                 if (item.correct === status) {
    //                     count++;
    //                 } else {
    //                     count = 1
    //                     status = item.correct
    //                 }
    //             })
    //             if (((count < 3) || (count == 3 && questions[random].correct !== status))) {
    //                 questionRandom.push(questions[random])
    //                 arrRandom.push(random)
    //             }
    //         }
    //     }
    //     return questionRandom
    // }

    //Lấy n câu ngẫu nhiên tỉ lệ đúng sai 50/50 k quá 3 câu có đáp án trùng liền kề
    async randomQuestion(idgame: number, qty: number) {
        const questionTrue = await this.questionLogicalRepository
            .createQueryBuilder('question')
            .where('question.correct=true').andWhere('question.gameId=:id', { id: idgame })
            .orderBy('RAND()')
            .limit(Math.ceil(qty / 2))
            .getMany()
        const questionFalse = await this.questionLogicalRepository
            .createQueryBuilder('question')
            .where('question.correct=false').andWhere('question.gameId=:id', { id: idgame })
            .orderBy('RAND()')
            .limit(Math.floor(qty / 2))
            .getMany()
        const arrQuestion = [...questionFalse, ...questionTrue]
        let arrRandom: number[] = []
        let questionRandom: QuestionLogical[] = []
        while (questionRandom.length < qty) {
            let status: boolean = null
            let count = 0
            var i=0
            const random = Math.round(Math.random() * (arrQuestion.length - 1))
            if (!arrRandom.includes(random)) {
                questionRandom.forEach(item => {
                    if (item.correct === status) {
                        count++;
                    } else {
                        count = 1
                        status = item.correct
                    }
                })
                if (((count < 3) || (count == 3 && arrQuestion[random].correct !== status))) {
                    questionRandom.push(arrQuestion[random])
                    arrRandom.push(random)
                } else {
                    const totalQuestionTrue = questionRandom.filter(question => question.correct).length
                    const totalQuestionFalse = questionRandom.filter(question => !question.correct).length
                    if ((status === true && (Math.floor(qty / 2) - totalQuestionFalse) === 0)
                        || (status === false && (Math.ceil(qty / 2) - totalQuestionTrue) === 0)
                    ){
                        arrRandom=[]
                        questionRandom=[]
                        i++
                        console.log(i);
                    }
                }
            }
        }
        return questionRandom
    }

    async createQuestionLogical(questionDto: CreateQuestionDto) {
        const game = await this.gameRepository.findOneBy({ id: questionDto.gameId })
        if (!game) throw new BadRequestException("game not found")
        if (game.game_type !== GametypeEnum.LOGICAL)
            throw new BadRequestException("game phải có type là logical")
        const questionSave = this.questionLogicalRepository.create({ ...questionDto, game: game });
        return {
            data: await this.questionLogicalRepository.save(questionSave)
        }
    }

    async hrPlayLogical(uid: number, game: Game) {
        let gameresult = await this.gameResultRepository.findOne({
            where: {
                game: { id: game.id },
                hr: { id: uid }
            }
        })
        if (!gameresult) {
            gameresult = await this.gameResultRepository.save({
                game: game,
                time_start: new Date(),
                hr: { id: uid },
                time_remain: game.total_time
            })
            const questions = await this.randomQuestion(game.id, game.total_question)
            await Promise.all(questions.map(async (item, index) => {
                await this.answerQuestionRepository.save({
                    index: index + 1,
                    gameResult: gameresult,
                    questionLogical: item
                })
            }))
        }
        if (gameresult.status === StatusGameResultEnum.FINISH)
            throw new BadRequestException("Game đã kết thúc")
        const questionCurrent = (await this.answerQuestionRepository.findOne({
            where: { gameResult: { id: gameresult.id }, status: true },
            order: { index: "DESC" },
        }))?.index ?? 0
        const question = await this.answerQuestionRepository.findOne({
            where: { gameResult: { id: gameresult.id }, status: false, index: MoreThan(questionCurrent) },
            order: { index: "ASC" },
            relations: { questionLogical: true },
        });
        delete question.questionLogical.correct
        const data = { index: question.index, ...question.questionLogical }
        const time_remain = gameresult.status === StatusGameResultEnum.PAUSE ? gameresult.time_remain : Math.ceil(timeRemainValid(gameresult.time_remain, gameresult.time_start))
        if (time_remain <= 0) {
            this.gameResultRepository.update({ id: gameresult.id }, { status: StatusGameResultEnum.FINISH, time_remain: 0 })
            throw new BadRequestException("Thời gian chơi đã kết thúc")
        }
        this.gameResultRepository.update({ id: gameresult.id }, { time_start: new Date(), status: StatusGameResultEnum.PLAY, time_remain })
        return {
            question: data,
            game: {
                gametype: game.game_type,
                time: time_remain,
                score: gameresult.score,
                totalQuestions: game.total_question
            }
        }
    }

    // //

    async playLogical(user: any, game: Game) {
        let gameresult = await this.gameResultRepository.findOne({
            where: {
                candidate: { id: user.id },
                game: { id: game.id },
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
            const questions = await this.randomQuestion(game.id, game.total_question)
            await Promise.all(questions.map(async (item, index) => {
                await this.answerQuestionRepository.save({
                    index: index + 1,
                    gameResult: gameresult,
                    questionLogical: item
                })
            }))
        }
        if (gameresult.status === StatusGameResultEnum.FINISH)
            throw new BadRequestException("Game đã kết thúc")
        const questionCurrent = (await this.answerQuestionRepository.findOne({
            where: { gameResult: { id: gameresult.id }, status: true },
            order: { index: "DESC" },
        }))?.index ?? 0
        const question = await this.answerQuestionRepository.findOne({
            where: { gameResult: { id: gameresult.id }, status: false, index: MoreThan(questionCurrent) },
            order: { index: "ASC" },
            relations: { questionLogical: true },
        });
        delete question.questionLogical.correct
        const data = { index: question.index, ...question.questionLogical }
        const time_remain = gameresult.status === StatusGameResultEnum.PAUSE ? gameresult.time_remain : Math.ceil(timeRemainValid(gameresult.time_remain, gameresult.time_start))
        if (time_remain <= 0) {
            await this.gameResultRepository.update({ id: gameresult.id }, { status: StatusGameResultEnum.FINISH, time_remain: 0 })
            this.UserService.changeStatusCandidateAssessment(user)
            throw new BadRequestException("Thời gian chơi đã kết thúc")
        }
        this.gameResultRepository.update({ id: gameresult.id }, { time_start: new Date(), status: StatusGameResultEnum.PLAY, time_remain })
        return {
            question: data,
            game: {
                gametype: game.game_type,
                time: time_remain,
                score: gameresult.score,
                totalQuestions: game.total_question
            }
        }
    }

    async Answer(gameResult: GameResult, answerDto: AnswerLogicalDto, qid: number, user: any) {
        const questionIngame = (await this.answerQuestionLogicalRepository.findOne({
            where: {
                gameResult: { id: gameResult.id },
                questionLogical: { id: qid }
            },
            relations: { questionLogical: true }
        }))
        if (!questionIngame) {
            throw new NotFoundException("Question không thuộc về bài thi")
        }
        if (questionIngame.status) {
            throw new BadRequestException("Bạn đã trả lời câu này")
        }
        const time_remain = Math.ceil(timeRemainValid(gameResult.time_remain, gameResult.time_start))
        if (time_remain <= 0) {
            await this.gameResultRepository.update({ id: gameResult.id }, { status: StatusGameResultEnum.FINISH, time_remain: 0 })
            this.UserService.changeStatusCandidateAssessment(user)
            throw new BadRequestException("Thời gian chơi đã kết thúc")
        }
        const { questionLogical } = questionIngame
        const answerUpdate = {
            status: true,
            point: answerDto.answer === questionLogical.correct ? 1 : 0,
            is_correct: answerDto.answer === questionLogical.correct,
            answer: answerDto.answer
        }
        this.answerQuestionLogicalRepository.update({ id: questionIngame.id }, answerUpdate)
        const answer = await this.answerQuestionLogicalRepository.findBy({ gameResult: { id: gameResult.id }, status: true })
        const totalQuest = await this.answerQuestionLogicalRepository.findBy({ gameResult: { id: gameResult.id } })
        const nextQuestion = (await this.answerQuestionLogicalRepository.findOne({
            where: {
                gameResult: { id: gameResult.id },
                index: MoreThan(questionIngame.index),
                status: false
            },
            order: { index: "ASC" },
            relations: { questionLogical: true }
        }))?.questionLogical
        delete nextQuestion?.correct
        const gameResultUpdate = {
            status: ((answer.length === totalQuest.length) || !nextQuestion) ? StatusGameResultEnum.FINISH : StatusGameResultEnum.PLAY,
            score: gameResult.score + answerUpdate.point,
        }
        await this.gameResultRepository.update({ id: gameResult.id }, gameResultUpdate)
        if (gameResultUpdate.status === StatusGameResultEnum.FINISH) {
            this.UserService.changeStatusCandidateAssessment(user)
            return {
                result: answerUpdate.is_correct,
                question: {},
                game: {
                    gametype: GametypeEnum.LOGICAL,
                    time: time_remain,
                    score: gameResultUpdate.score,
                    totalQuestions: 20
                },
                message: "Chúc mừng bạn đã hoàn thành game"
            }
        }
        return {
            result: answerUpdate.is_correct,
            question: {
                index: questionIngame.index + 1,
                ...nextQuestion
            },
            game: {
                gametype: GametypeEnum.LOGICAL,
                time: time_remain,
                score: gameResultUpdate.score,
                totalQuestions: 20
            }
        }
    }

    async AnswerLogical(gid: number, qid: number, answerDto: AnswerLogicalDto, user: any) {
        if (!checkPlayer(user)) {
            const gameResultHr = await this.GameResultService.findAndCheckGameHrValid(gid, user.id)
            return this.Answer(gameResultHr, answerDto, qid, user)
        }
        await this.UserService.findAndCheckAssessmentValid({id:user.assessmentId})
        const gameResult = await this.GameResultService.findAndCheckGameValid(gid, user.id, user.assessmentId)
        return this.Answer(gameResult, answerDto, qid, user)
    }
    async exitLogical(gameResult: GameResult, user: any) {
        const time_remain = Math.ceil(timeRemainValid(gameResult.time_remain, gameResult.time_start))
        if (time_remain <= 0) {
            await this.gameResultRepository.update({ id: gameResult.id }, { status: StatusGameResultEnum.FINISH, time_remain: 0 })
            this.UserService.changeStatusCandidateAssessment(user)
            throw new BadRequestException("Thời gian chơi đã kết thúc")
        }
        return this.gameResultRepository.update({ id: gameResult.id }, { status: StatusGameResultEnum.PAUSE, time_remain })
    }

    async skipQuestion(qid: number, gameResult: GameResult, user: any) {
        const time_remain = Math.ceil(timeRemainValid(gameResult.time_remain, gameResult.time_start))
        if (time_remain <= 0) {
            await this.gameResultRepository.update({ id: gameResult.id }, { status: StatusGameResultEnum.FINISH, time_remain: 0 })
            this.UserService.changeStatusCandidateAssessment(user)
            throw new BadRequestException("Thời gian chơi đã kết thúc")
        }
        const questionIngame = (await this.answerQuestionLogicalRepository.findOne({
            where: {
                gameResult: { id: gameResult.id },
                questionLogical: { id: qid }
            },
            relations: { questionLogical: true }
        }))
        if (!questionIngame) {
            throw new NotFoundException("Question không thuộc về bài thi")
        }
        const nextQuestion = (await this.answerQuestionLogicalRepository.findOne({
            where: {
                gameResult: { id: gameResult.id },
                index: MoreThan(questionIngame.index),
                status: false
            },
            order: { index: "ASC" },
            relations: { questionLogical: true }
        }))?.questionLogical
        delete nextQuestion?.correct
        if (!nextQuestion) {
            await this.gameResultRepository.update({ id: gameResult.id }, { status: StatusGameResultEnum.FINISH })
            this.UserService.changeStatusCandidateAssessment(user)
            return {
                result: null,
                question: {},
                game: {
                    gametype: gameResult.game.game_type,
                    time: time_remain,
                    score: gameResult.score,
                    totalQuestions: gameResult.game.total_question
                },
                message: "Chúc mừng bạn đã hoàn thành game"
            }
        }
        return {
            result: null,
            question: {
                index: questionIngame.index + 1,
                ...nextQuestion
            },
            game: {
                gametype: gameResult.game.game_type,
                time: time_remain,
                score: gameResult.score,
                totalQuestions: gameResult.game.total_question
            }
        }
    }
}