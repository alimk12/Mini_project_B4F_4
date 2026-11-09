import { RunResult, RunStatus } from '../../../types/execution.types';

type Tone = 'ok' | 'warn' | 'bad' | 'neutral';

const TITLES: Record<RunStatus, string> = {
  PASSED: 'Passed',
  WRONG_ANSWER: 'Wrong answer',
  SYNTAX_ERROR: 'Syntax error',
  RUNTIME_ERROR: 'Runtime error',
  FUNCTION_NOT_FOUND: 'Function not found',
  TIME_LIMIT_EXCEEDED: 'Time limit exceeded',
  MOCK: 'Mock run',
};

const TONES: Record<RunStatus, Tone> = {
  PASSED: 'ok',
  WRONG_ANSWER: 'warn',
  SYNTAX_ERROR: 'bad',
  RUNTIME_ERROR: 'bad',
  FUNCTION_NOT_FOUND: 'bad',
  TIME_LIMIT_EXCEEDED: 'bad',
  MOCK: 'neutral',
};

// Values are shown with JSON.stringify, so "1" and 1 look different.
const show = (value: unknown) => JSON.stringify(value) ?? 'undefined';

export default function RunOutput({ result }: { result: RunResult }) {
  const showValues = result.status === 'PASSED' || result.status === 'WRONG_ANSWER';
  const isCodeError = result.status === 'SYNTAX_ERROR' || result.status === 'RUNTIME_ERROR';

  return (
    <section className="attempt__output">
      <h3 className={`attempt__output-status attempt__output-status--${TONES[result.status]}`}>{TITLES[result.status]}</h3>
      <p className="attempt__output-message">{result.message}</p>

      {isCodeError && result.error && (
        <>
          <p className="attempt__output-error">{`${result.error.type}: ${result.error.message}`}</p>
          {result.error.line !== null && <p className="attempt__output-line">{`Line ${result.error.line}`}</p>}
        </>
      )}

      {showValues && (
        <>
          <p className="attempt__output-row">
            <span className="attempt__output-label">Input:</span> <code>{show(result.input)}</code>
          </p>
          <div className="attempt__compare">
            <div className="attempt__compare-box">
              <span className="attempt__output-label">Expected output</span>
              <code>{show(result.expectedOutput)}</code>
            </div>
            <div className="attempt__compare-box">
              <span className="attempt__output-label">Your output</span>
              <code>{show(result.actualOutput)}</code>
            </div>
          </div>
        </>
      )}

      {/* The student's console.log has its own box: it is never mixed with the error. */}
      {result.logs.length > 0 && (
        <div className="attempt__console">
          <h4 className="attempt__console-title">Console</h4>
          <pre className="attempt__console-lines">{result.logs.join('\n')}</pre>
        </div>
      )}
    </section>
  );
}