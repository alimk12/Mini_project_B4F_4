import { Body, Controller, Delete, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { QuestionIdParamDto, TestIdParamDto } from '../common/dto/id-param.dto';
import { QuestionDto } from './dto/question.dto';
import { QuestionsService } from './questions.service';

@ApiTags('instructor-content')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('INSTRUCTOR')
@Controller('instructor')
export class QuestionsController {
  constructor(private readonly questions: QuestionsService) {}

  @ApiOperation({ summary: 'Add an MCQ question (2–6 options, exactly one correct)' })
  @Post('tests/:testId/questions')
  createQuestion(@Param() p: TestIdParamDto, @Body() dto: QuestionDto) {
    return this.questions.create(p.testId, dto);
  }

  @ApiOperation({ summary: 'Replace an MCQ question and all its options' })
  @Put('questions/:questionId')
  replaceQuestion(@Param() p: QuestionIdParamDto, @Body() dto: QuestionDto) {
    return this.questions.replace(p.questionId, dto);
  }

  @ApiOperation({ summary: 'Delete an MCQ question' })
  @Delete('questions/:questionId')
  deleteQuestion(@Param() p: QuestionIdParamDto) {
    return this.questions.remove(p.questionId);
  }
}
