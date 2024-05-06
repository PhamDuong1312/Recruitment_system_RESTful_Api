import { Controller, Get, Param, ParseIntPipe, Req, Res, UseGuards } from "@nestjs/common";
import { BaseController } from "../app/base.controller";
import { GameResultService } from "./gameresult.service";
import { AuthGuard } from "src/shared/guards/auth.guard";
import { Request, Response } from "express";
import { RoleGuard } from "src/shared/guards/role.guard";
import { RoleEnum } from "src/common/enum/role.enum";

@Controller("gameresults")
export class GameResultsController extends BaseController {
    constructor(private gameResultsService: GameResultService) {
        super();
    }

    //lấy kết quả chơi các game của candidate hiện tại
    @UseGuards(AuthGuard)
    @Get("/current")
    async getResultsCurrentCandidate(@Res() res: Response, @Req() req: Request) {
        const data = await this.gameResultsService.getResultsCurrent(req['user']);
        return this.successResponse({
            data: { data }
        }, res);
    }

    // lấy kết quả chơi 1 game của candidate/hr hiện tại
    @UseGuards(AuthGuard)
    @Get("/current/game/:id")
    async getDetailResultsCurrent(@Res() res: Response, @Req() req: Request,
        @Param("id", ParseIntPipe) id: number) {
        const data = await this.gameResultsService.getDetailResultCurrent(id, req['user']);
        return this.successResponse({
            data
        }, res);
    }

    @UseGuards(AuthGuard, new RoleGuard([RoleEnum.ADMIN, RoleEnum.HR]))
    @Get("/assessment/:id")
    async getResultsByassessment(@Param("id", ParseIntPipe) id: number, @Res() res: Response, @Req() req: Request) {
        const data = await this.gameResultsService.getResultByAssessment(id, req['user']);
        return this.successResponse({
            data: { data }
        }, res);
    }

    @UseGuards(AuthGuard,new RoleGuard([RoleEnum.ADMIN, RoleEnum.HR]))
    @Get("/:id")
    async getResult(@Param("id", ParseIntPipe) id: number, @Res() res: Response, @Req() req: Request) {
        const data = await this.gameResultsService.getResult(id, req['user']);
        return this.successResponse({
            data,
        }, res);
    }
    

    @UseGuards(AuthGuard, new RoleGuard([RoleEnum.ADMIN]))
    @Get("")
    async getAllResults(@Res() res: Response) {
        const data = await this.gameResultsService.getAllResults();
        return this.successResponse({
            data: { data }
        }, res);
    }
}
