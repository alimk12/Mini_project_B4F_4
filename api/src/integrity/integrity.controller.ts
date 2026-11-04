import { Body, Controller, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtPayload } from '../auth/jwt-payload.interface';
import { AttemptIdParamDto } from '../common/dto/id-param.dto';
import { ViolationDto } from './dto/violation.dto';
import { AttemptSessionGuard } from './guards/attempt-session.guard';
import { IntegrityService } from './integrity.service';

@ApiTags('student-integrity')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Attempt-Session', required: true, description: 'Session key returned when the attempt was started' })
@UseGuards(JwtAuthGuard, RolesGuard, AttemptSessionGuard)
@Roles('STUDENT')
@Controller('student/attempts')
export class IntegrityController {
  constructor(private readonly integrity: IntegrityService) {}

  @ApiOperation({ summary: 'Report an exam-rule violation; the server counts it and decides warning or termination' })
  @HttpCode(200)
  @Post(':attemptId/violations')
  reportViolation(@Param() p: AttemptIdParamDto, @Body() dto: ViolationDto, @CurrentUser() user: JwtPayload) {
    return this.integrity.recordViolation(user.sub, p.attemptId, dto.type);
  }
}
