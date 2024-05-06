import { Body, Controller, Get, Inject, Param, ParseBoolPipe, ParseIntPipe, Post, Put, Req, Res, UseGuards, forwardRef } from "@nestjs/common";
import { UserService } from "../service/user.service";
import { BaseController } from "src/modules/app/base.controller";
import { Request, Response } from "express";
import { candidateAccessDto } from "../dto/candidateAccess.dto";
import { AuthGuard } from "src/shared/guards/auth.guard";
import { RoleEnum } from "src/common/enum/role.enum";
import { RoleGuard } from "src/shared/guards/role.guard";

@Controller("candidates")
export class UserCandidateController extends BaseController {
    constructor(
        private UserService: UserService,
        
    ) {
        super()
    }
    @UseGuards(AuthGuard, new RoleGuard([RoleEnum.HR, RoleEnum.ADMIN]))
    @Get("/assessment/:id")
    async getCandidateByAssessment(@Param("id", ParseIntPipe) id: number, @Res() res: Response,@Req() req: Request) {
        const data = await this.UserService.getCandidateByAssessment(id,req["user"])
        return this.successResponse({
            data
        }, res);
    }
    @Post("/access")
    async candidateAccess(@Body() candidate: candidateAccessDto, @Res() res: Response) {
        const data = await this.UserService.candidateAccess(candidate)
        return this.successResponse({
            data,
        }, res)
    }

    @UseGuards(AuthGuard)
    @Get("/me")
    async getCurrentUser(@Res() res: Response,@Req() req: Request) {
        return this.successResponse({
            data:req["user"]
        }, res);
    }

    


}
