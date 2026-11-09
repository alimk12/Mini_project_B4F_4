import { useEffect, useRef, useState } from 'react';
import { formatRemaining, getRemainingMs } from '../../utils/serverClock';
import './Countdown.css';

interface Props {
  deadline: string;
  serverOffsetMs: number;
  onTimeUp: () => void;
}

const WARNING_MS = 5 * 60 * 1000;
const ERROR_MS = 60 * 1000;

export default function Countdown({ deadline, serverOffsetMs, onTimeUp }: Props) {
  const [remainingMs, setRemainingMs] = useState(() => getRemainingMs(deadline, serverOffsetMs));
  const onTimeUpRef = useRef(onTimeUp);
  const hasFiredRef = useRef(false);

  // Always call the latest onTimeUp without restarting the timer.
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  // A new deadline means a new countdown, so it may fire again.
  useEffect(() => {
    hasFiredRef.current = false;
  }, [deadline]);

  useEffect(() => {
    function tick() {
      const left = getRemainingMs(deadline, serverOffsetMs);
      setRemainingMs(left);
      if (left === 0 && !hasFiredRef.current) {
        hasFiredRef.current = true;
        onTimeUpRef.current();
      }
    }
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [deadline, serverOffsetMs]);

  let level = '';
  if (remainingMs < ERROR_MS) level = ' countdown--error';
  else if (remainingMs < WARNING_MS) level = ' countdown--warning';

  return (
    <span role="timer" className={`countdown${level}`}>
      {formatRemaining(remainingMs)}
    </span>
  );
}