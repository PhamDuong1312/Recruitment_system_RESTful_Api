import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { RoleEnum } from 'src/common/enum/role.enum';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly roles: RoleEnum []) {}
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return this.roles.includes(user.role)
  }
}
