import { useEffect, useState } from 'react';

interface ScoreCounterProps {
  value: number;
  suffix?: string;
  className?: string;
  duration?: number;
}

export function ScoreCounter({ value, suffix = '', className = '', duration = 1000 }: ScoreCounterProps) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    setDisplay(0);
    const start = performance.now();

    function animate(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quart
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }, [value, duration]);

  return (
    <span className={`tabular-nums ${className}`}>
      {display}{suffix}
    </span>
  );
}
