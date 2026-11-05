import { useLocation } from 'react-router-dom';
import CatalogFormPage from '@/features/catalog/components/CatalogFormPage';
import CatalogListPage from '@/features/catalog/components/CatalogListPage';
import useRoles from '@/hooks/useRoles';
import useUsers from '@/hooks/useUsers';

const resourceHooks = { roles: useRoles, users: useUsers };

export default function ProtectedModelPage({ type }) {
  const location = useLocation();
  const editing = /\/[^/]+\/edit$/.test(location.pathname);
  const creating = location.pathname.endsWith('/new');

  return editing || creating
    ? <CatalogFormPage key={location.pathname} type={type} useResource={resourceHooks[type]} />
    : <CatalogListPage type={type} useResource={resourceHooks[type]} />;
}
