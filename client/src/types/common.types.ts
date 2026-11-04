export type Role = 'INSTRUCTOR' | 'STUDENT';
export type TestType = 'MCQ' | 'CODING';
export type TestStatus = 'DRAFT' | 'PUBLISHED';
export type AttemptStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'EXPIRED' | 'TERMINATED';
export type StudentTestState = 'LOCKED' | 'AVAILABLE' | AttemptStatus;
export type ClientViolationType = 'FULLSCREEN_EXIT' | 'TAB_HIDDEN' | 'COPY' | 'CUT' | 'PASTE_EXTERNAL' | 'DROP_EXTERNAL';
export type ViolationType = ClientViolationType | 'NEW_SESSION';
export type ViolationGroup = 'FOCUS' | 'CLIPBOARD' | 'SESSION';
