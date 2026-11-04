import { Body, Controller, Delete, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ProblemIdParamDto, TestIdParamDto } from '../common/dto/id-param.dto';
import { ProblemDto } from './dto/problem.dto';
import { ProblemsService } from './problems.service';

@ApiTags('instructor-content')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('INSTRUCTOR')
@Controller('instructor')
export class ProblemsController {
  constructor(private readonly problems: ProblemsService) {}

  @ApiOperation({ summary: 'Add a coding problem (1+ sample case, 3+ hidden cases)' })
  @Post('tests/:testId/problems')
  createProblem(@Param() p: TestIdParamDto, @Body() dto: ProblemDto) {
    return this.problems.create(p.testId, dto);
  }

  @ApiOperation({ summary: 'Replace a coding problem and all its test cases' })
  @Put('problems/:problemId')
  replaceProblem(@Param() p: ProblemIdParamDto, @Body() dto: ProblemDto) {
    return this.problems.replace(p.problemId, dto);
  }

  @ApiOperation({ summary: 'Delete a coding problem' })
  @Delete('problems/:problemId')
  deleteProblem(@Param() p: ProblemIdParamDto) {
    return this.problems.remove(p.problemId);
  }
}
