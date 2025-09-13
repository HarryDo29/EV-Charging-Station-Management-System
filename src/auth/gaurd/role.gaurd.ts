import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorator/role.decorator';
import { Role } from 'src/enums/role.enum';
import { AuthenticatedUserDto } from '../dto/authenticated-user.dto';

@Injectable()
export class RoleGaurd implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Lấy ra các role được yêu cầu từ decorator @Roles
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    // Nếu endpoint không yêu cầu role nào, cho phép truy cập
    if (!requiredRoles) {
      return true;
    }
    // 2. Lấy thông tin user từ request
    // (Giả sử AuthGuard('jwt') đã chạy trước và gắn `user` vào request)
    const user = context.switchToHttp().getRequest<AuthenticatedUserDto>();
    // 3. Kiểm tra xem user có role phù hợp không
    // Trả về true nếu user có ít nhất MỘT trong các role được yêu cầu
    return requiredRoles.some((role) => role.includes(user.role));
  }
}
