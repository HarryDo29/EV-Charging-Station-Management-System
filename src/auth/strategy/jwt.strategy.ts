import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Role } from 'src/enums/role.enum';
import { AccountService } from 'src/account/account.service';
import { AuthenticatedUserDto } from '../dto/authenticated-user.dto';

// Định nghĩa kiểu dữ liệu cho payload để code an toàn hơn
interface JwtPayload {
  id: string; // Thường là user ID
  name: string;
  role: Role; // Giả sử bạn có roles trong token
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly accountService: AccountService,
  ) {
    super({
      // 1. Chỉ định cách trích xuất token từ request
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // 2. Không bỏ qua khi token hết hạn
      ignoreExpiration: false,

      // 3. Cung cấp secret key để Passport có thể xác thực chữ ký của token
      secretOrKey: configService.get<string>('SECRET_KEY_ACCESS_TOKEN')!,
    });
  }

  /**
   * Phương thức này sẽ được Passport gọi TỰ ĐỘNG
   * sau khi nó đã xác thực thành công chữ ký và ngày hết hạn của token.
   * @param payload Dữ liệu đã được giải mã từ token.
   * @returns Đối tượng sẽ được NestJS gắn vào request.user
   */
  async validate(payload: JwtPayload): Promise<AuthenticatedUserDto> {
    // Tại đây, bạn có thể thực hiện thêm các bước kiểm tra logic,
    // ví dụ: kiểm tra xem user ID trong payload có tồn tại trong DB không.
    const account = await this.accountService.findAccountById(payload.id);
    if (!account) {
      throw new UnauthorizedException('Account not found');
    }
    // Nếu mọi thứ ổn, trả về đối tượng user sẽ được gắn vào request
    return {
      id: payload.id,
      name: payload.name,
      role: payload.role,
    };
  }
}
