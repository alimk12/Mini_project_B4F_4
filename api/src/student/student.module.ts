import { Module } from '@nestjs/common';
import { AttemptStateModule } from '../attempt-state/attempt-state.module';
import { ExecutionModule } from '../execution/execution.module';
import { IntegrityModule } from '../integrity/integrity.module';
import { AttemptsService } from './attempts.service';
import { CodingService } from './coding.service';
import { McqService } from './mcq.service';
import { StudentAttemptsController } from './student-attempts.controller';
import { StudentTestsController } from './student-tests.controller';
import { StudentTestsService } from './student-tests.service';

@Module({
  imports: [AttemptStateModule, ExecutionModule, IntegrityModule],
  controllers: [StudentTestsController, StudentAttemptsController],
  providers: [StudentTestsService, AttemptsService, McqService, CodingService],
})
export class StudentModule {}
