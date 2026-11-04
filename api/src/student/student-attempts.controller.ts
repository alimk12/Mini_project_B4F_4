import { Body, Controller, Get, HttpCode, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtPayload } from '../auth/jwt-payload.interface';
import { AttemptIdParamDto, AttemptProblemParamDto, AttemptQuestionParamDto } from '../common/dto/id-param.dto';
import { AttemptSessionGuard } from '../integrity/guards/attempt-session.guard';
import { AttemptsService } from './attempts.service';
import { CodingService } from './coding.service';
import { CodeDto } from './dto/code.dto';
import { McqAnswerDto } from './dto/mcq-answer.dto';
import { McqSubmitDto } from './dto/mcq-submit.dto';
import { McqService } from './mcq.service';

@ApiTags('student-attempts')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Attempt-Session', required: true, description: 'Session key returned when the attempt was started' })
@UseGuards(JwtAuthGuard, RolesGuard, AttemptSessionGuard)
@Roles('STUDENT')
@Controller('student/attempts')
export class StudentAttemptsController {
  constructor(
    private readonly attempts: AttemptsService,
    private readonly mcq: McqService,
    private readonly coding: CodingService,
  ) {}

  @ApiOperation({ summary: 'The attempt screen data (never correct options or hidden test cases)' })
  @Get(':attemptId')
  getAttempt(@Param() p: AttemptIdParamDto, @CurrentUser() user: JwtPayload) {
    return this.attempts.getForStudent(user.sub, p.attemptId);
  }

  @ApiOperation({ summary: 'Autosave one MCQ answer (optionId null clears it)' })
  @Put(':attemptId/mcq-answers/:questionId')
  saveMcqAnswer(@Param() p: AttemptQuestionParamDto, @Body() dto: McqAnswerDto, @CurrentUser() user: JwtPayload) {
    return this.mcq.saveAnswer(user.sub, p.attemptId, p.questionId, dto);
  }

  @ApiOperation({ summary: 'Submit all MCQ answers once; the backend calculates the score' })
  @HttpCode(200)
  @Post(':attemptId/mcq-submit')
  submitMcq(@Param() p: AttemptIdParamDto, @Body() dto: McqSubmitDto, @CurrentUser() user: JwtPayload) {
    return this.mcq.submit(user.sub, p.attemptId, dto);
  }

  @ApiOperation({ summary: 'Run code on the sample case (no score, 20 runs per problem)' })
  @HttpCode(200)
  @Post(':attemptId/problems/:problemId/run')
  runCode(@Param() p: AttemptProblemParamDto, @Body() dto: CodeDto, @CurrentUser() user: JwtPayload) {
    return this.coding.run(user.sub, p.attemptId, p.problemId, dto.code);
  }

  @ApiOperation({ summary: 'Submit code for the hidden tests, once per problem (counts only)' })
  @HttpCode(200)
  @Post(':attemptId/problems/:problemId/submit')
  submitCode(@Param() p: AttemptProblemParamDto, @Body() dto: CodeDto, @CurrentUser() user: JwtPayload) {
    return this.coding.submit(user.sub, p.attemptId, p.problemId, dto.code);
  }

  @ApiOperation({ summary: 'Finish the coding test (one transaction; unsubmitted problems score 0)' })
  @HttpCode(200)
  @Post(':attemptId/finish')
  finish(@Param() p: AttemptIdParamDto, @CurrentUser() user: JwtPayload) {
    return this.coding.finish(user.sub, p.attemptId);
  }
}
