import { Module } from '@nestjs/common';
import { CodeExecutionService } from './code-execution.service';

// Majed: add MockExecutionProvider and Judge0ExecutionProvider here.
@Module({
  providers: [CodeExecutionService],
  exports: [CodeExecutionService],
})
export class ExecutionModule {}
