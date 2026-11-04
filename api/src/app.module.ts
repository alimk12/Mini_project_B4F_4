import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AttemptStateModule } from './attempt-state/attempt-state.module';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { ExecutionModule } from './execution/execution.module';
import { IntegrityModule } from './integrity/integrity.module';
import { PrismaModule } from './prisma/prisma.module';
import { ResultsModule } from './results/results.module';
import { StudentModule } from './student/student.module';
import { TestsModule } from './tests/tests.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    CommonModule,
    AuthModule,
    AttemptStateModule,
    IntegrityModule,
    ExecutionModule,
    TestsModule,
    StudentModule,
    ResultsModule,
  ],
})
export class AppModule {}
