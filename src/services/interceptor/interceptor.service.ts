import {
  ArgumentsHost,
  CallHandler,
  ExceptionFilter,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { map, Observable } from "rxjs";
import { Response as ExpressResponse } from "express";

export const enum RESPONSE_MESSAGE {
  OK = "Success",
  CREATED = "Created",
  BAD_REQUEST = "Bad Request",
  UNAUTHORIZED = "Unauthorized",
  FORBIDDEN = "Forbidden",
  NOT_FOUND = "Not Found",
  INTERNAL_SERVER_ERROR = "Internal Server Error",
  INVALID_CREDENTIALS = "Invalid email or password",
}

export type Response<T> = {
  statusCode: HttpStatus;
  message: RESPONSE_MESSAGE;
  response: T;
};

export const ResponseMessage: Partial<Record<HttpStatus, RESPONSE_MESSAGE>> = {
  [HttpStatus.OK]: RESPONSE_MESSAGE.OK,
  [HttpStatus.CREATED]: RESPONSE_MESSAGE.CREATED,
  [HttpStatus.BAD_REQUEST]: RESPONSE_MESSAGE.BAD_REQUEST,
  [HttpStatus.UNAUTHORIZED]: RESPONSE_MESSAGE.UNAUTHORIZED,
  [HttpStatus.FORBIDDEN]: RESPONSE_MESSAGE.FORBIDDEN,
  [HttpStatus.NOT_FOUND]: RESPONSE_MESSAGE.NOT_FOUND,
  [HttpStatus.INTERNAL_SERVER_ERROR]: RESPONSE_MESSAGE.INTERNAL_SERVER_ERROR,
};

@Injectable()
export class ResponseService<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<Response<T>> | Promise<Observable<Response<T>>> {
    return next.handle().pipe(
      map(data => {
        const statusCode = context.switchToHttp().getResponse()
          .statusCode as HttpStatus;
        return {
          statusCode,
          message: ResponseMessage[statusCode] || RESPONSE_MESSAGE.OK,
          response: data,
        };
      }),
    );
  }
}

@Injectable()
export class ExceptionService implements ExceptionFilter {
  throw(message: string, status: keyof typeof HttpStatus) {
    throw new HttpException(message, HttpStatus[status]);
  }
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<ExpressResponse>();

    const isHttpExceptionInstance = exception instanceof HttpException;

    const status = isHttpExceptionInstance
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = isHttpExceptionInstance
      ? exception.getResponse()
      : RESPONSE_MESSAGE.INTERNAL_SERVER_ERROR;

    const errorMessage =
      typeof message === "string"
        ? message
        : (message as any).message || RESPONSE_MESSAGE.INTERNAL_SERVER_ERROR;

    response.status(status).json({
      statusCode: status,
      message: errorMessage,
      response: null,
    });
  }
}
