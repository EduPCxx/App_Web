import { useCallback, useEffect, useRef, useState } from 'react';
import { dashboardService } from '@/services/dashboardService';
import { notifyError } from '@/utils/alerts';

// Estadísticas del dashboard. Se piden al montar la pantalla (siempre frescas tras crear/editar/borrar).
export default function useDashboardStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const inFlight = useRef(null);

  const load = useCallback(() => {
    if (inFlight.current) return inFlight.current;

    const request = (async () => {
      let failure = null;
      setLoading(true);
      setError(null);
      try {
        setStats(await dashboardService.getStats());
      } catch (err) {
        failure = err;
        setError(err.message);
      } finally {
        setLoading(false);
        inFlight.current = null;
      }
      if (failure) await notifyError(failure, 'No se pudieron cargar las estadísticas');
    })();

    inFlight.current = request;
    return request;
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { stats, loading, error, reload: load };
}
