import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Req, Res, UseGuards } from "@nestjs/common";
import { BaseController } from "src/modules/app/base.controller";
import { UserService } from "../service/user.service";
import { Request, Response } from "express";
import { RoleGuard } from "src/shared/guards/role.guard";
import { RoleEnum } from "src/common/enum/role.enum";
import { AuthGuard } from "src/shared/guards/auth.guard";
import { createHrDto } from "../dto/createHr.dto";

@Controller("admin/users")
export class UserAdminController extends BaseController {
    constructor(private userService: UserService) { super() }

    @Post("/create_hr")
    @UseGuards(AuthGuard, new RoleGuard([RoleEnum.ADMIN]))
    async createHr(@Body() hr: createHrDto, @Res() res: Response) {
        const data = await this.userService.createHr(hr)
        return this.successResponse({
            data,
            message: "create hr success"
        }, res)
    }

    @Get("/hrs")
    @UseGuards(AuthGuard, new RoleGuard([RoleEnum.ADMIN]))
    async getAllHr(@Res() res: Response,
        @Req() req: Request,
    ) {
        const data = await this.userService.getAllHr(req)
        return this.successResponse({
            data,
        }, res)
    }

    @Delete("/delete/:id")
    @UseGuards(AuthGuard, new RoleGuard([RoleEnum.ADMIN]))
    async deleteHr(@Res() res: Response,
       @Param('id',ParseIntPipe) id: number
    ) {
        const data = await this.userService.deleteHr(id)
        return this.successResponse({
            data,
            message:"delete hr success"
        }, res)
    }

}
