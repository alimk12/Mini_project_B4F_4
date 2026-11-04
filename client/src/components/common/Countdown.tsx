// PLACEHOLDER (Phase 0). Owner: Maya, Task 2 Part A. Props are fixed.
interface Props { deadline: string; serverOffsetMs: number; onExpire?: () => void }

export default function Countdown({ deadline }: Props) {
  return <span role="timer">until {deadline}</span>;
}
