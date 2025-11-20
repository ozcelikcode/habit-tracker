import { useEffect, useState } from 'react';

/**
 * Keeps a client clock aligned with the server time reported by /api/health.
 */
export function useServerTime() {
  const [offsetMs, setOffsetMs] = useState(0);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let timerId;

    const sync = async () => {
      try {
        const response = await fetch('/api/health');
        if (!response.ok) {
          throw new Error('Health check failed');
        }
        const payload = await response.json();
        if (payload?.time) {
          const serverTs = new Date(payload.time).getTime();
          setOffsetMs(serverTs - Date.now());
        }
      } catch {
        setOffsetMs(0);
      }
    };

    sync();
    timerId = setInterval(() => {
      setNow(new Date(Date.now() + offsetMs));
    }, 1000);

    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [offsetMs]);

  useEffect(() => {
    setNow(new Date(Date.now() + offsetMs));
  }, [offsetMs]);

  return now;
}
