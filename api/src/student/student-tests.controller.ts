import { Body, Controller, Get, Param, Post, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtPayload } from '../auth/jwt-payload.interface';
import { TestIdParamDto } from '../common/dto/id-param.dto';
import { AttemptsService } from './attempts.service';
import { StartAttemptDto } from './dto/start-attempt.dto';
import { StudentTestsService } from './student-tests.service';

@ApiTags('student-tests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('STUDENT')
@Controller('student/tests')
export class StudentTestsController {
  constructor(
    private readonly tests: StudentTestsService,
    private readonly attempts: AttemptsService,
  ) {}

  @ApiOperation({ summary: 'Published tests in order, each with its state for this student' })
  @Get()
  getTests(@CurrentUser() user: JwtPayload) {
    return this.tests.listForStudent(user.sub);
  }

  @ApiOperation({ summary: 'One published test (403 when unpublished)' })
  @Get(':testId')
  getTest(@Param() p: TestIdParamDto, @CurrentUser() user: JwtPayload) {
    return this.tests.getForStudent(user.sub, p.testId);
  }

  @ApiOperation({ summary: 'Start (201) or resume (200) an attempt; returns a new session key' })
  @Post(':testId/attempts')
  async startAttempt(
    @Param() p: TestIdParamDto,
    @Body() dto: StartAttemptDto,
    @CurrentUser() user: JwtPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { created, view } = await this.attempts.start(user.sub, p.testId, dto);
    res.status(created ? 201 : 200);
    return view;
  }
}
