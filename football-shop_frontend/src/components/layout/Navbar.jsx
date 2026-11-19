import { Link, matchPath, useLocation } from 'react-router-dom';
import { FiLogOut, FiMenu, FiPlus } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { ROUTE_TITLES } from '@/config/navigation';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils/cn';

const titleFor = (pathname) =>
  ROUTE_TITLES.find((route) => matchPath({ path: route.path, end: true }, pathname))?.title ?? 'Panel';

export default function Navbar({ onMenuClick, onLogout, className }) {
  const { pathname } = useLocation();
  const { user, isAdmin, canManageCatalog } = useAuth();

  return (
    <header className={cn('flex items-center justify-between gap-3 rounded-3xl border border-white/10 bg-[#181818]/90 px-4 py-3.5 shadow-soft backdrop-blur-xl md:px-5', className)}>
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" className="lg:hidden" onClick={onMenuClick} aria-label="Abrir menú">
          <FiMenu size={16} aria-hidden="true" />
        </Button>
        <div>
          <p className="hidden text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 sm:block">
            {isAdmin ? 'Football Shop / Admin' : canManageCatalog ? 'Football Shop / Editor' : 'Football Shop / Catálogo'}
          </p>
          <h1 className="text-lg font-semibold tracking-tight text-white">{titleFor(pathname)}</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {canManageCatalog && pathname.startsWith('/products') && pathname !== '/products/new' && (
          <Button asChild size="sm" variant="default">
            <Link to="/products/new">
              <FiPlus aria-hidden="true" /> <span className="hidden sm:inline">Crear producto</span>
            </Link>
          </Button>
        )}

        {user && (
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2 py-1.5">
            <span className="hidden text-xs text-white/75 md:inline">{user.email}</span>
            <Button type="button" variant="outline" size="sm" onClick={onLogout}>
              <FiLogOut aria-hidden="true" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
