import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const send = (statusCode: number, message: string) => res.status(statusCode).json({ statusCode, message });

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse() as string | { message?: string | string[] };
      let message = typeof body === 'string' ? body : body.message ?? exception.message;
      if (Array.isArray(message)) message = message[0];
      if (status === 404 && typeof message === 'string' && message.startsWith('Cannot ')) message = 'Endpoint not found.';
      if (status === 400 && exception.constructor.name === 'BadRequestException' && /JSON/i.test(String(message)))
        message = 'Invalid request body.';
      return send(status, String(message));
    }
    if ((exception as { type?: string })?.type === 'entity.parse.failed') return send(400, 'Invalid request body.');
    if (exception instanceof Prisma.PrismaClientKnownRequestError && exception.code === 'P2002')
      return send(409, 'This record already exists.');

    this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    return send(HttpStatus.INTERNAL_SERVER_ERROR, 'Something went wrong. Please try again.');
  }
}
