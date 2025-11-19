import { useCallback, useEffect, useState } from 'react';

export function useDashboardData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/dashboard');
      if (!response.ok) {
        throw new Error('API isteği başarısız oldu');
      }
      const payload = await response.json();
      setData(payload);
    } catch (err) {
      setError(err.message ?? 'Bilinmeyen hata');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
