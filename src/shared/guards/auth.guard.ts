import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Candidate } from 'src/entities/candidate.entity';
import { env } from 'src/env';
import { UsersRepository } from 'src/modules/user/repositories/user.repository';
import { Repository } from 'typeorm';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private jwtService: JwtService,
        private userRepository: UsersRepository,
        @InjectRepository(Candidate) private candidateRepository: Repository<Candidate>
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        
        if (!token) {
            throw new UnauthorizedException();
        }
        try {
            const payload = await this.jwtService.verifyAsync(
                token,
                {
                    secret: env.jwt.secret
                }
            );
            // 💡 We're assigning the payload to the request object here
            // so that we can access it in our route handlers
            let user: any = await this.userRepository.findOneBy({ email: payload.email });
            if (!user) {
                user = await this.candidateRepository.findOneBy({ email: payload.email });
                if (!user)
                    throw new UnauthorizedException();
                user.assessmentId=payload.assessmentId;
            }
            
            request['user'] = user;
        } catch {
            throw new UnauthorizedException();
        }
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}