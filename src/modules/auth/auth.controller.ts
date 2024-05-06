import { Body, Controller, Post, Res } from "@nestjs/common";
import { LoginDto } from "./dto/login.dto";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { BaseController } from "../app/base.controller";
import { Response } from "express";

@Controller()
export class AuthController extends BaseController {
    constructor(private authService: AuthService){
        super()
    }

    @Post("/login")
    async login(@Body() user:LoginDto,@Res() res:Response){
        const data = await this.authService.login(user)
        return this.successResponse({
            data,
            message:"login success"
        },res)
    }

    @Post("/register")
    async register(@Body() user:RegisterDto,@Res() res:Response){
        const data= await this.authService.register(user)
        return this.successResponse({
            data,
            message:"register success"
        },res)
    }
}