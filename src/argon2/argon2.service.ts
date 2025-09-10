import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

@Injectable()
export class Argon2Service {
  /**
   * Hash một mật khẩu thô.
   * @param plainPassword Mật khẩu chưa hash.
   * @returns Chuỗi hash.
   */
  async hash(plainPassword: string): Promise<string> {
    return argon2.hash(plainPassword);
  }

  /**
   * So sánh mật khẩu thô với một chuỗi hash.
   * @param plainPassword Mật khẩu chưa hash.
   * @param hash Chuỗi hash lấy từ database.
   * @returns `true` nếu khớp, `false` nếu không.
   */
  async compare(plainPassword: string, hash: string): Promise<boolean> {
    return argon2.verify(hash, plainPassword);
  }
}
