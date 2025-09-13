import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response as ExpressResponse } from 'express'; // <-- Bước 1: Import type từ express

export interface Response<T> {
  statusCode: number;
  message: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    // Bước 2: Lấy đối tượng response và chỉ định rõ kiểu dữ liệu
    const response = context.switchToHttp().getResponse<ExpressResponse>();

    return next.handle().pipe(
      map((data) => ({
        // Bước 3: Bây giờ việc truy cập `response.statusCode` là an toàn
        statusCode: response.statusCode,
        message: 'Success',
        data: data as T,
      })),
    );
  }
}
