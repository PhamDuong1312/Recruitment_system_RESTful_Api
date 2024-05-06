import { BadRequestException, HttpException, HttpStatus, Injectable, UnauthorizedException } from "@nestjs/common";
import { UserService } from "../user/service/user.service";
import { LoginDto } from "./dto/login.dto";
import { UsersRepository } from "../user/repositories/user.repository";
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from "./dto/register.dto";
import * as bcrypt from 'bcrypt';
import { RoleEnum } from "src/common/enum/role.enum";
@Injectable()
export class AuthService {
    constructor(
        private userRepository: UsersRepository,
        private jwtService: JwtService
    ) { }
    async login(params: LoginDto): Promise<any> {
        const user = await this.userRepository.findOneBy({ email: params.email });
        if(!user){
            // Email not registered account
            throw new HttpException("Email not registered account",HttpStatus.UNAUTHORIZED)
        }
        const isPasswordValid = await bcrypt.compare(params.password,user.password);
        if (!isPasswordValid) {
            throw new HttpException("incorrect password",HttpStatus.UNAUTHORIZED);
        }
        const { password, ...result } = user;
        const token= await this.jwtService.signAsync(JSON.parse(JSON.stringify(result)))
        return {token}
    }
    async register(params: RegisterDto): Promise<any> {
        const user = await this.userRepository.findOneBy({ email: params.email });
        if (user) throw new BadRequestException("Email exists already");
        const newUser = this.userRepository.create({
            ...params,
            password: await bcrypt.hash(params.password, 10),
            role: RoleEnum.CANDIDATE
        })
        const rs = await this.userRepository.save(newUser)
        return rs
    }
}