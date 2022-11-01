import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  InternalServerErrorException
} from "@nestjs/common"
import { Observable, throwError } from "rxjs"
import { catchError } from "rxjs/operators"

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err: any) => {
        if (err.status === 500) {
          console.log(err)
          return throwError(() => new InternalServerErrorException())
        } else {
          return throwError(() => err)
        }
      })
    )
  }
}
