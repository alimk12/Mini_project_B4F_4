/** Same value as the backend GRACE_SECONDS: after the deadline, wait this long, then reload the attempt. */
export const GRACE_SECONDS = 10;
export const MAX_RUNS_PER_PROBLEM = 20;
export const starterCode = (functionName: string) => `function ${functionName}(/* parameters */) {\n  \n}\n`;
