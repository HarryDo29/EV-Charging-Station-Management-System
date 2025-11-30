import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs'; // import observable from rxjs to handle data
import { map } from 'rxjs/operators'; // import map from rxjs operators to transform data
import { Response as ExpressResponse } from 'express'; // import type from express

// interface for response data
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
    // get response object and specify data type
    const response = context.switchToHttp().getResponse<ExpressResponse>();

    return next.handle().pipe(
      map((data) => ({
        // now it's safe to access `response.statusCode`
        statusCode: response.statusCode,
        message: 'Success',
        data: data as T,
      })),
    );
  }
}
