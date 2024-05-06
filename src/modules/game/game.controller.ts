import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Req, Res, UseGuards } from "@nestjs/common";
import { BaseController } from "../app/base.controller";
import { gameService } from "./game.service";
import { Request, Response } from "express";
import { AuthGuard } from "src/shared/guards/auth.guard";
import { RoleGuard } from "src/shared/guards/role.guard";
import { RoleEnum } from "src/common/enum/role.enum";
import { CreateGameDto } from "./dto/createGame.dto";

@Controller("games")
export class GamesController extends BaseController {
    constructor(private gameService: gameService) {
        super();
    }

    @UseGuards(AuthGuard)
    @Get("/:id")
    async getDetailGame(@Param("id", ParseIntPipe) id: number, @Res() res: Response) {
        const data = await this.gameService.getDetailGame(id)
        return this.successResponse({ data }, res);
    }

    @UseGuards(AuthGuard, new RoleGuard([RoleEnum.ADMIN]))
    @Get()
    async getAllGame(@Res() res: Response) {
        const data = await this.gameService.getAllGames()
        return this.successResponse({ data }, res);
    }

    @UseGuards(AuthGuard, new RoleGuard([RoleEnum.ADMIN]))
    @Post("/create/")
    async createGame(@Body() game: CreateGameDto, @Res() res: Response) {
        const data = await this.gameService.createGame(game)
        return this.successResponse({ data, message: "create game success" }, res);
    }
    //khi người chơi start game
    @UseGuards(AuthGuard)
    @Get('/:id/play')
    async playGame(@Param('id', ParseIntPipe) id: number, @Res() res: Response, @Req() req: Request) {
        const data = await this.gameService.playGame(id, req["user"]);
        return this.successResponse({
            data
        }, res);
    }

    @UseGuards(AuthGuard)
    @Get('/:id/exit')
    async exitGame(@Param('id', ParseIntPipe) id: number, @Res() res: Response, @Req() req: Request) {
        const data = await this.gameService.exitGame(id, req["user"]);
        return this.successResponse({
            data
        }, res);
    }

    @UseGuards(AuthGuard)
    @Get("/:id/question/:qid/skip")
    async skipQuestion(@Param('id', ParseIntPipe) id: number,
        @Param('qid', ParseIntPipe) qid: number,
        @Res() res: Response,
        @Req() req: Request) {
        const data = await this.gameService.skipQuestion(id,qid, req["user"])
        return this.successResponse({
            data,
        }, res)
    }

    @UseGuards(AuthGuard)
    @Put("/:id/endgame")
    async endGame(@Param('id', ParseIntPipe) id: number,
        @Res() res: Response,
        @Req() req: Request) {
        const data = await this.gameService.endGame(id, req["user"])
        return this.successResponse({
            data,
        }, res)
    }
}