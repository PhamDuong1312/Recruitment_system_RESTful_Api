import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, Req, Res, UseGuards } from "@nestjs/common";
import { BaseController } from "../app/base.controller";
import { AssessmentService } from "./assessment.service";
import { Response, Request } from "express";
import { createAssessmentDto } from "./dto/createAssessment.dto";
import { AuthGuard } from "src/shared/guards/auth.guard";
import { RoleGuard } from "src/shared/guards/role.guard";
import { RoleEnum } from "src/common/enum/role.enum";
import { updateAssessmentDto } from "./dto/updateAssessment.dto";
import { gameService } from "../game/game.service";

@Controller("/assessments")
export class AssessmentController extends BaseController {
    constructor(private assessmentService: AssessmentService,
        private gameService: gameService
    ) { super() }
    //lấy tất cả các assessment
    @UseGuards(AuthGuard, new RoleGuard([RoleEnum.ADMIN]))
    @Get()
    async getall(@Res() res: Response, @Query('archived') archived: boolean) {
        const data = await this.assessmentService.getall(archived)
        return this.successResponse({
            data,
        }, res)
    }
    // lấy các assessment thuộc về 1 hr 

    @UseGuards(AuthGuard, new RoleGuard([RoleEnum.HR, RoleEnum.ADMIN]))
    @Get("/hr/:id")
    async getAssessmentByHr(@Param('id', ParseIntPipe) id: number, @Res() res: Response, @Req() req: Request,
        @Query('archived') archived: boolean) {
        const data = await this.assessmentService.getAssessmentByHr(id, req["user"],archived)
        return this.successResponse({
            data,
        }, res)
    }
    // lấy chi tiết assessment
    @Get("/:id")
    async getdetail(@Param("id", ParseIntPipe) id: number, @Res() res: Response) {
        const data = await this.assessmentService.getdetail(id)
        return this.successResponse({
            data,
        }, res)
    }
    // // hr tạo mới assessment
    @UseGuards(AuthGuard, new RoleGuard([RoleEnum.HR]))
    @Post("/create")
    async create(@Body() assessmentDto: createAssessmentDto, @Res() res: Response, @Req() req: Request) {
        const data = await this.assessmentService.create(assessmentDto, req["user"].id)
        return this.successResponse({
            data,
        }, res)
    }

    // hr xóa assessment của mình
    @UseGuards(AuthGuard, new RoleGuard([RoleEnum.HR]))
    @Delete("delete/:id")
    async delete(@Param("id", ParseIntPipe) id: number, @Res() res: Response, @Req() req: Request) {
        await this.assessmentService.delete(id, req["user"].id)
        return this.successResponse({}, res)
    }
    // hr sửa assessment của mình
    @UseGuards(AuthGuard, new RoleGuard([RoleEnum.HR]))
    @Put("update/:id")
    async update(@Param("id", ParseIntPipe) id: number, @Res() res: Response, @Body() assessmentDto: updateAssessmentDto,
        @Req() req: Request
    ) {
        await this.assessmentService.update(id, assessmentDto, req["user"].id)
        return this.successResponse({
        }, res)
    }
    // hr archive assessment của mình
    @UseGuards(AuthGuard, new RoleGuard([RoleEnum.HR]))
    @Put("archive/:id")
    async archive(@Param("id", ParseIntPipe) id: number, @Res() res: Response,
        @Req() req: Request
    ) {
        await this.assessmentService.archive(id, req["user"].id)
        return this.successResponse({
        }, res)
    }

    //lấy các game theo assessment
    @UseGuards(AuthGuard)
    @Get("/:id/games")
    async getGameByAssessment(@Param("id", ParseIntPipe) id: number, @Req() req: Request, @Res() res: Response) {
        const data = await this.gameService.getGameByAssessment(id, req["user"])
        return this.successResponse({
            data,
        }, res)
    }
    
    @UseGuards(AuthGuard)
    @Get("/current/status")
    async getStatusCandidateAssessmentCurrent(@Req() req: Request, @Res() res: Response) {
        const data = await this.assessmentService.getStatusCandidateAssessmentCurrent(req["user"])
        return this.successResponse({
            data,
        }, res)
    }

}