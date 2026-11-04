import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AttemptIdParamDto } from '../common/dto/id-param.dto';
import { AttemptsQueryDto } from './dto/attempts-query.dto';
import { ResultsService } from './results.service';

@ApiTags('instructor-attempts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('INSTRUCTOR')
@Controller('instructor/attempts')
export class InstructorAttemptsController {
  constructor(private readonly results: ResultsService) {}

  @ApiOperation({ summary: 'All attempts, filtered by test and status, searched by student name' })
  @Get()
  getAttempts(@Query() q: AttemptsQueryDto) {
    return this.results.listAttempts(q);
  }

  @ApiOperation({ summary: 'One attempt with its result details and violation log' })
  @Get(':attemptId')
  getAttempt(@Param() p: AttemptIdParamDto) {
    return this.results.getAttemptDetail(p.attemptId);
  }
}
