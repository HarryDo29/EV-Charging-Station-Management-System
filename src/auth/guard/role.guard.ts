import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorator/role.decorator';
import { Role } from 'src/enums/role.enum';
import { AuthenticatedUserDto } from '../dto/authenticated-user.dto';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Take roles from decorator @Roles
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    // If endpoint does not require any role, allow access
    if (!requiredRoles) {
      return true;
    }
    // 2. Take user information from request
    // (Assume AuthGuard('jwt') has run before and attached `user` to request)
    const user = context.switchToHttp().getRequest<AuthenticatedUserDto>();
    // 3. Check if user has the required role
    // Return true if user has at least one of the required roles
    return requiredRoles.some((role) => role.includes(user.role));
  }
}
