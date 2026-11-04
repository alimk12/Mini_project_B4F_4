import { Module } from '@nestjs/common';
import { AttemptStateService } from './attempt-state.service';
import { ScoringService } from './scoring.service';

@Module({ providers: [AttemptStateService, ScoringService], exports: [AttemptStateService, ScoringService] })
export class AttemptStateModule {}
