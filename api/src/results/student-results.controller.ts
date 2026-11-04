import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtPayload } from '../auth/jwt-payload.interface';
import { ResultsService } from './results.service';

@ApiTags('student-results')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('STUDENT')
@Controller('student/results')
export class StudentResultsController {
  constructor(private readonly results: ResultsService) {}

  @ApiOperation({ summary: "The student's own finished tests" })
  @Get()
  getResults(@CurrentUser() user: JwtPayload) {
    return this.results.listStudentResults(user.sub);
  }
}
