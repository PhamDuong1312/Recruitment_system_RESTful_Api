import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, Res, UseGuards } from "@nestjs/common";
import { BaseController } from "../app/base.controller";
import { QuestionLogicalService } from "./questionlogical.service";
import { Request, Response } from "express";
import { AuthGuard } from "src/shared/guards/auth.guard";
import { RoleGuard } from "src/shared/guards/role.guard";
import { RoleEnum } from "src/common/enum/role.enum";
import { CreateQuestionDto } from "./dto/createquestion.dto";
import { AnswerLogicalDto } from "../user/dto/answerQuestion.dto";

@Controller("questionslogical")
export class QuestionLogicalController extends BaseController{
    constructor(private QuestionLogicalService: QuestionLogicalService){
        super();
    }

    @UseGuards(AuthGuard,new RoleGuard([RoleEnum.ADMIN]))
    @Get('/game/:id')
    async getAllQuestionsByGame(@Param('id',ParseIntPipe) id: number,@Res() res:Response){
        const data = await this.QuestionLogicalService.getAllQuestionsByGame(id);
        return this.successResponse({
            data
        },res);
    }

    
    @UseGuards(AuthGuard,new RoleGuard([RoleEnum.ADMIN]))
    @Get('/:id')
    async GetDetailQuestion(@Param('id',ParseIntPipe) id: number,@Res() res:Response){
        const data = await this.QuestionLogicalService.GetDetailQuestion(id);
        return this.successResponse({
            data
        },res);
    }

    //Admin thêm câu hỏi logical
    @UseGuards(AuthGuard,new RoleGuard([RoleEnum.ADMIN]))
    @Post('/create')
    async createQuestionLogical(@Body() questionDto :CreateQuestionDto,
       @Res() res:Response){
        const data = await this.QuestionLogicalService.createQuestionLogical(questionDto);
        return this.successResponse({
            data
        },res);
    }

    //Trả lời câu hỏi Logical
    @UseGuards(AuthGuard)
    @Post("/:qid/game/:gid/answer")
    async AnswerLogical(@Param('gid', ParseIntPipe) gid: number
        , @Param('qid', ParseIntPipe) qid: number
        , @Body() answerDto: AnswerLogicalDto, @Res() res: Response,
        @Req() req: Request) {
        const data = await this.QuestionLogicalService.AnswerLogical(gid, qid, answerDto,req["user"])
        return this.successResponse({
            data,
        }, res)
    }
}