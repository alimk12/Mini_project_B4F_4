import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TestIdParamDto } from '../common/dto/id-param.dto';
import { InstructorTestsService } from './instructor-tests.service';

@ApiTags('instructor-tests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('INSTRUCTOR')
@Controller('instructor/tests')
export class InstructorTestsController {
  constructor(private readonly tests: InstructorTestsService) {}

  @ApiOperation({ summary: 'The three tests with their counts' })
  @Get()
  getTests() {
    return this.tests.findAll();
  }

  @ApiOperation({ summary: 'One test with its questions or problems (with correct options and hidden cases)' })
  @Get(':testId')
  getTest(@Param() p: TestIdParamDto) {
    return this.tests.findOne(p.testId);
  }

  @ApiOperation({ summary: 'Publish a test (MCQ needs 5+ questions, coding needs 1+ problem)' })
  @Patch(':testId/publish')
  publish(@Param() p: TestIdParamDto) {
    return this.tests.publish(p.testId);
  }

  @ApiOperation({ summary: 'Unpublish a test (rejected while an attempt is in progress)' })
  @Patch(':testId/unpublish')
  unpublish(@Param() p: TestIdParamDto) {
    return this.tests.unpublish(p.testId);
  }
}
