import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Assessment } from "src/entities/assessment.entity";
import { Repository } from "typeorm";
import { createAssessmentDto } from "./dto/createAssessment.dto";
import { RoleEnum } from "src/common/enum/role.enum";
import { Assessment_Game } from "src/entities/assessment_game.entity";
import { UsersRepository } from "../user/repositories/user.repository";
import { updateAssessmentDto } from "./dto/updateAssessment.dto";
import { gameService } from "../game/game.service";
import * as moment from "moment";
import { Candidate_Assessment } from "src/entities/candidate_assessment.entity";
import { checkCandidate } from "src/ultils";
import { GameResult } from "src/entities/gameresult.entity";
@Injectable()
export class AssessmentService {
    constructor(@InjectRepository(Assessment) private assessmentRepository: Repository<Assessment>,
        private gameService: gameService,
        @InjectRepository(Assessment_Game) private assessmentGameRepository: Repository<Assessment_Game>,
        @InjectRepository(Candidate_Assessment) private candidateAssessmentRepository: Repository<Candidate_Assessment>,
        private userRepository: UsersRepository,
        @InjectRepository(GameResult) private gameResultRepository: Repository<GameResult>,

    ) {

    }
    async getall(archived: boolean) {
        const query = {
        }
        if(archived!==undefined) {
            query["archived"] = archived
        }
        const data =await this.assessmentRepository.find({ where: query, relations: { user: true } });
        return {
            filter:query,
            data
        }
    }

    async getdetail(id: number) {
        const assessment = await this.assessmentRepository.findOneById(id)
        if (!assessment)
            throw new NotFoundException('Assessment not found')
        return assessment
    }
    async getAssessmentByHr(id: number, user: any, archived: boolean) {
        const query = {
        }
        if(archived!==undefined) {
            query["archived"] = archived
        }
        const data = await this.assessmentRepository.findBy({ user: { id }, ...query })
        if (user.role === RoleEnum.ADMIN)
            return {
                filter:query,
                data
            }
        if (user.id !== id)
            throw new UnauthorizedException();
        return {
            filter:query,
            data
        }
    }

    async create(assessmentDto: createAssessmentDto, hrid: number) {
        if (!moment(assessmentDto.startDate).isSameOrBefore(moment(assessmentDto.endDate), "date")) {
            throw new BadRequestException("date invalid")
        }
        const gamesByHr = await this.gameService.getGameByHr(hrid, hrid);
        const games = []
        gamesByHr.forEach((game) => {
            if (assessmentDto.games.includes(game.id)) {
                games.push(game)
            }
        })
        const user = await this.userRepository.findOneBy({ id: hrid })
        const newAssessment = this.assessmentRepository.create({
            user,
            name: assessmentDto.name,
            startDate: assessmentDto.startDate,
            endDate: assessmentDto.endDate,
        });
        const assessment = await this.assessmentRepository.save(newAssessment);
        if (games.length) {
            games.forEach(async (item) => {
                await this.assessmentGameRepository.save({
                    assessment: assessment,
                    game: item
                })
            })
        }
        return assessment
    }

    async delete(id: number, hrid: number) {
        const assesmentDel = await this.assessmentRepository.findOne({ relations: { user: true }, where: { id } })
        if (!assesmentDel) {
            throw new NotFoundException("fail");
        }
        if (assesmentDel.user.id !== hrid) {
            throw new UnauthorizedException();
        }
        await this.candidateAssessmentRepository.delete({ assessment: { id } })
        await this.assessmentGameRepository.delete({ assessment: { id } })
        await this.gameResultRepository.update({assessment:{id}},{assessment:null})
        return await this.assessmentRepository.delete(id)
    }

    async update(id: number, assessmentDto: updateAssessmentDto, hrid: number) {

        const assesmentUpdate = await this.assessmentRepository.findOne({ relations: { user: true }, where: { id } })
        if (!assesmentUpdate) {
            throw new NotFoundException("fail");
        }
        if (assesmentUpdate.user.id !== hrid) {
            throw new UnauthorizedException();
        }
        const startDate = assessmentDto.startDate ? new Date(assessmentDto.startDate) : assesmentUpdate.startDate
        const endDate = assessmentDto.endDate ? new Date(assessmentDto.endDate) : assesmentUpdate.endDate
        if (!moment(startDate).isSameOrBefore(moment(endDate), "date")) {
            throw new BadRequestException("date invalid")
        }
        return await this.assessmentRepository.update(id, {
            name: assessmentDto.name,
            startDate,
            endDate
        })
    }
    async archive(id: number, hrid: number) {
        const assesmentUpdate = await this.assessmentRepository.findOne({ relations: { user: true }, where: { id } })
        if (!assesmentUpdate) {
            throw new NotFoundException("fail");
        }
        if (assesmentUpdate.user.id !== hrid) {
            throw new UnauthorizedException();
        }
        if (assesmentUpdate.archived) {
            throw new BadRequestException("Assessment này đã archived!");
        }
        return await this.assessmentRepository.update(id, { archived: true })
    }
    getStatusCandidateAssessmentCurrent(user){
        checkCandidate(user);
        return this.candidateAssessmentRepository.findOne({where:{candidate:{id: user.id},assessment:{id: user.assessmentId}}})
    }
}