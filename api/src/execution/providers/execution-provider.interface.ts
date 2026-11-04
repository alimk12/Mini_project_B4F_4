import { ExecutionMode, ProviderRawResult } from '../execution.types';

export interface ExecutionProvider {
  readonly mode: ExecutionMode;
  /** Runs one complete program (student code + harness) and returns the raw result. */
  execute(sourceCode: string): Promise<ProviderRawResult>;
}
