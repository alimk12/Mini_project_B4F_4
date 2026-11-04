import { Injectable } from '@nestjs/common';

/** The only source of "now" in the backend. */
@Injectable()
export class ClockService {
  now(): Date {
    return new Date();
  }
}
