import { Body, Controller, Param, ParseIntPipe, Post, Req, Res, UseGuards } from "@nestjs/common";
import { BaseController } from "../app/base.controller";
import { AnswerLevelMemoryService } from "./levelmemory.service";
import { Request, Response } from "express";
import { AuthGuard } from "src/shared/guards/auth.guard";
import { AnswerMemoryDto } from "./dto/answermemory.dto";

@Controller("levelsmemory")
export class AnswerLevelMemoryController extends BaseController {
    constructor(private answerLevelMemoryService: AnswerLevelMemoryService) {
        super()
    }

    @UseGuards(AuthGuard)
    @Post("/:lid/game/:gid/answer")
    async AnswerMemory(@Res() res: Response,
        @Body() answer: AnswerMemoryDto,
        @Param("gid", ParseIntPipe) gid: number,
        @Param("lid", ParseIntPipe) lid: number,
        @Req() req: Request
    ) {
        const data = await this.answerLevelMemoryService.AnswerMemory(gid, lid,answer, req["user"])
        return this.successResponse({ data }, res);
    }
}