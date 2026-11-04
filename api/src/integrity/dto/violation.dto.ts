import { ApiProperty } from '@nestjs/swagger';
import { Allow } from 'class-validator';

export const CLIENT_VIOLATION_TYPES = ['FULLSCREEN_EXIT', 'TAB_HIDDEN', 'COPY', 'CUT', 'PASTE_EXTERNAL', 'DROP_EXTERNAL'] as const;
export type ClientViolationType = (typeof CLIENT_VIOLATION_TYPES)[number];

// Owner: Esmaeel. STUB: replace @Allow() with @IsIn(..., { message: 'Unknown violation type.' }).
export class ViolationDto {
  @ApiProperty({ enum: CLIENT_VIOLATION_TYPES, example: 'FULLSCREEN_EXIT' })
  @Allow()
  type: ClientViolationType;
}
