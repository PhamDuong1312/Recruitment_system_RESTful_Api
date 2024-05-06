import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, Res, UseGuards, UsePipes } from "@nestjs/common";
import { UserService } from "../service/user.service";
import { BaseController } from "src/modules/app/base.controller";
import { Request, Response } from "express";
import { inviteCandidateDto } from "../dto/inviteCandidate.Dto";
import { AuthGuard } from "src/shared/guards/auth.guard";
import { RoleGuard } from "src/shared/guards/role.guard";
import { RoleEnum } from "src/common/enum/role.enum";
import { gameService } from "src/modules/game/game.service";

@Controller("hr")
export class UserHrController extends BaseController {
    constructor(private userService: UserService,
                private gameService: gameService        
        ){
        super()
    }
    //hr mời candidate tham gia
    @UseGuards(AuthGuard,new RoleGuard([RoleEnum.HR]))
    @Post("invite")
    async inviteCandidate(@Body() inviteCandidateDto:inviteCandidateDto,@Res() res: Response,@Req() req: Request){
        const data=await this.userService.inviteCandidate(inviteCandidateDto,req["user"].id)
        return this.successResponse({
            data,
            message:"invite Candidate success"
        },res)       
    }

    @UseGuards(AuthGuard,new RoleGuard([RoleEnum.HR]))
    @Get("/:id/games")
    async getGamesByHr(@Param("id",ParseIntPipe) id:number,@Res() res: Response,@Req() req: Request){
        const data=await this.gameService.getGameByHr(id,req["user"].id)
        return this.successResponse({
            data,
        },res)
    }
}
