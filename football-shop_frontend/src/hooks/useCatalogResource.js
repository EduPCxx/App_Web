import { useCallback, useEffect, useState } from 'react';
import { notifyError } from '@/utils/alerts';

export default function useCatalogResource(service, label, { autoLoad = true } = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await service.list());
    } catch (err) {
      setError(err.message);
      await notifyError(err, `No se pudieron cargar ${label}`);
    } finally {
      setLoading(false);
    }
  }, [label, service]);

  useEffect(() => {
    if (!autoLoad) return undefined;
    load();
    return undefined;
  }, [autoLoad, load]);

  const create = useCallback(
    async (payload) => {
      try {
        const created = await service.create(payload);
        setItems((current) => [created, ...current]);
        return created;
      } catch (err) {
        await notifyError(err, `No se pudo crear ${label}`);
        return null;
      }
    },
    [label, service]
  );

  const update = useCallback(
    async (id, payload) => {
      try {
        const updated = await service.update(id, payload);
        setItems((current) => current.map((item) => (item._id === id ? updated : item)));
        return updated;
      } catch (err) {
        await notifyError(err, `No se pudo actualizar ${label}`);
        return null;
      }
    },
    [label, service]
  );

  const remove = useCallback(
    async (id) => {
      try {
        await service.remove(id);
        setItems((current) => current.filter((item) => item._id !== id));
        return true;
      } catch (err) {
        await notifyError(err, `No se pudo eliminar ${label}`);
        return false;
      }
    },
    [label, service]
  );

  return { items, loading, error, load, create, update, remove };
}
