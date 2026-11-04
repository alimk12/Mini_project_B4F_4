import { BadRequestException, ValidationError, ValidationPipe } from '@nestjs/common';

function firstMessage(errors: ValidationError[]): string {
  for (const e of errors) {
    if (e.constraints) {
      const values = Object.values(e.constraints);
      if (values.length) return values[0];
    }
    if (e.children?.length) {
      const nested = firstMessage(e.children);
      if (nested) return nested;
    }
  }
  return 'Invalid request body.';
}

export function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    stopAtFirstError: true,
    exceptionFactory: (errors) => new BadRequestException(firstMessage(errors)),
  });
}
