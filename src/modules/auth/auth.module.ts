import { Module, forwardRef } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { UsersModule } from "../user/users.module";
import { AuthService } from "./auth.service";
import { JwtModule } from "@nestjs/jwt";
import { env } from "src/env";

@Module({
    imports:[
    
        forwardRef(()=> UsersModule),
        JwtModule.register({
            global:true,
            secret: env.jwt.secret,
            signOptions: { expiresIn: env.jwt.expires },
          })
    ],
    controllers:[AuthController],
    providers:[AuthService],
    exports:[AuthService]
})
export class AuthModule {}