import { Module } from '@nestjs/common';
import { AttemptStateModule } from '../attempt-state/attempt-state.module';
import { IntegrityModule } from '../integrity/integrity.module';
import { InstructorAttemptsController } from './instructor-attempts.controller';
import { ResultsService } from './results.service';
import { StudentResultsController } from './student-results.controller';

@Module({
  imports: [AttemptStateModule, IntegrityModule],
  controllers: [InstructorAttemptsController, StudentResultsController],
  providers: [ResultsService],
})
export class ResultsModule {}
