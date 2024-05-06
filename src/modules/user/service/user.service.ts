import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { UsersRepository } from "../repositories/user.repository";
import { RoleEnum } from "src/common/enum/role.enum";
import * as bcrypt from 'bcrypt';
import { inviteCandidateDto } from "../dto/inviteCandidate.Dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Assessment } from "src/entities/assessment.entity";
import { In, Repository } from "typeorm";
import { Candidate_Assessment } from "src/entities/candidate_assessment.entity";
import { createHrDto } from "../dto/createHr.dto";
import { Game } from "src/entities/game.entity";
import { GameResult } from "src/entities/gameresult.entity";
import { Hr_Game } from "src/entities/hr_game.entity";
import { User } from "src/entities/users.entity";
import { checkEmail, checkPlayer } from "src/ultils";
import { Candidate } from "src/entities/candidate.entity";
import { candidateAccessDto } from "../dto/candidateAccess.dto";
import { JwtService } from "@nestjs/jwt";
import { Assessment_Game } from "src/entities/assessment_game.entity";
import { Request } from "express";
import pagination from "src/ultils/pagination";
import { MailService } from "src/common/lib/mail/mail.lib";
import * as moment from "moment";
import { StatusGameResultEnum } from "src/common/enum/statusgame.enum";

@Injectable()
export class UserService {
    constructor(private userRepository: UsersRepository,
        private mailService: MailService,
        @InjectRepository(Assessment) private assessmentRepository: Repository<Assessment>,
        @InjectRepository(Candidate_Assessment) private candidateAssessmentRepository: Repository<Candidate_Assessment>,
        @InjectRepository(Game) private gameRepository: Repository<Game>,
        @InjectRepository(Hr_Game) private hrGameRepository: Repository<Hr_Game>,
        @InjectRepository(Candidate) private candidateRepository: Repository<Candidate>,
        @InjectRepository(Assessment_Game) private assessmentGameRepository: Repository<Assessment_Game>,
        @InjectRepository(GameResult) private gameresultRepository: Repository<GameResult>,
        private jwtService: JwtService

    ) { }

    async getAllHr(req: Request) {
        const hrs = await this.userRepository.findBy({ role: RoleEnum.HR })
        const page = Number(req.query.page) || 1
        const limit = Number(req.query.limit) || 10
        const total = hrs.length
        const skip = limit * (page - 1)
        const pages = pagination(page, limit, total)

        const data = await this.userRepository.find({
            where: { role: RoleEnum.HR },
            skip: skip,
            take: limit
        })
        return {
            filter: {
                limit, page
            },
            data,
            pages
        }

    }

    async deleteHr(id: number) {
        const hr = await this.userRepository.findOneBy({ id, role: RoleEnum.HR })
        if (!hr)
            throw new NotFoundException(`HR ${id} does not exist`)
        await this.hrGameRepository.delete({ user: { id } })
        await this.assessmentRepository.update({ user: { id } }, { user: null })
        await this.gameresultRepository.update({ hr: { id } }, { hr: null })
        await this.userRepository.delete({ id: id })
        return {}
    }

    async createHr(params: createHrDto) {
        const games = await this.gameRepository.findBy({ id: In([...params.games]) })
        const user = await this.userRepository.findOneBy({ email: params.email });
        if (user) throw new BadRequestException("Email exists already");
        const newUser = this.userRepository.create({
            email: params.email,
            fullname: params.fullname,
            password: await bcrypt.hash(params.password, 10),
            role: RoleEnum.HR
        })
        const rs: User = await this.userRepository.save(newUser)
        if (games.length) {
            games.forEach(async (item) => {
                await this.hrGameRepository.save({
                    user: rs,
                    game: item
                })
            })
        }
        return rs

    }

    async inviteCandidate(inviteCandidate: inviteCandidateDto, hrid: number) {
        const emails = inviteCandidate.emails.filter((email) => checkEmail(email))
        const assessment = await this.findAndCheckAssessmentValid({ id: inviteCandidate.assessment_id, user: { id: hrid } })
        const candidates = await this.candidateRepository.findBy({ email: In(emails) })
        await Promise.all(
            emails.map(async (email) => {
                if (!(await this.candidateRepository.findOneBy({ email }))) {
                    const candidateSave = await this.candidateRepository.save({ email })
                    candidates.push(candidateSave)
                    return candidateSave
                }
                return null
            }))

        const link = inviteCandidate.link ?? "https://test.paditech.com/assessment/" + assessment.id
        await Promise.all(candidates.map(async (candidate) => {
            if (!(await this.candidateAssessmentRepository
                .findOneBy({ candidate: { id: candidate.id }, assessment: { id: assessment.id } }))) {
                return await this.candidateAssessmentRepository.save({ candidate: candidate, assessment: assessment })
            }
            return null
        }))
        this.mailService.to(emails.join(',')).subject("THƯ MỜI THAM GIA TEST CỦA PADITECH")
            .html(`<p>Đây là link làm bài test : <a href="${link}">tại đây</a></p>`)
            .send()
        return { link }
    }

    async getCandidateByAssessment(id: number, user: any) {
        const data = (await this.candidateAssessmentRepository.find({ where: { assessment: { id } }, relations: { candidate: true } }))
            .map((item) => item.candidate)
        if (user.role === RoleEnum.ADMIN)
            return { data }
        const checkhr = await this.assessmentRepository.findOneBy({ id, user: { id: user.id } })
        if (!checkhr)
            throw new UnauthorizedException("Không phải Assessment bạn tạo!");
        return { data }

    }

    async candidateAccess(candidateAccess: candidateAccessDto) {
        await this.findAndCheckAssessmentValid({ id: candidateAccess.assessment_id })
        const checkInvited = await this.candidateAssessmentRepository.findOne({
            where: {
                candidate: { email: candidateAccess.email },
                assessment: { id: candidateAccess.assessment_id }
            },
            relations: { candidate: true, assessment: true }
        })
        if (!checkInvited)
            throw new UnauthorizedException("Bạn không có quyền tham gia Assessment này!")
        const token = await this.jwtService.signAsync({ ...checkInvited.candidate, assessmentId: checkInvited.assessment.id })
        return { token }
    }
    async findAndCheckAssessmentValid(query: {}) {
        const assessment = await this.assessmentRepository.findOneBy(query)
        if (!assessment)
            throw new NotFoundException("Assessment không tồn tại");
        if (assessment.archived || (!moment(Date.now()).isBetween(assessment.startDate, assessment.endDate)))
            throw new BadRequestException("Assessment không thể truy cập nữa!");
        return assessment
    }
    async EndGame(user: any, gameResult: GameResult) {
        await this.gameresultRepository.update({ id: gameResult.id }, { status: StatusGameResultEnum.FINISH, time_remain: 0 })
        this.changeStatusCandidateAssessment(user)
        return {
            result: {
                score: gameResult.score,
            }
        }
    }

    async changeStatusCandidateAssessment(user: any) {
        if (!checkPlayer(user)) {
            return
        }
        const totalGameInAss = (await this.assessmentGameRepository.find({
            where: {
                assessment: { id: user.assessmentId },
            }
        })).length
        const totalResult = (await this.gameresultRepository.find({
            where: {
                candidate: { id: user.id },
                assessment: { id: user.assessmentId },
                status: StatusGameResultEnum.FINISH
            }
        })).length
        if (totalResult === totalGameInAss)
            this.candidateAssessmentRepository.update({ candidate: { id: user.id }, assessment: { id: user.assessmentId } }, { status: true });
    }
}