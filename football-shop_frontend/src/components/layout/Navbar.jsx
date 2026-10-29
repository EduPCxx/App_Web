import { Link, matchPath, useLocation } from 'react-router-dom';
import { FiMenu, FiPlus, FiUser } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { ROUTE_TITLES } from '@/config/navigation';
import useAuth from '@/hooks/useAuth';
import { cn } from '@/utils/cn';

const titleFor = (pathname) =>
  ROUTE_TITLES.find((route) => matchPath({ path: route.path, end: true }, pathname))?.title ?? 'Panel';

export default function Navbar({ onMenuClick, className }) {
  const { pathname } = useLocation();
  const { user } = useAuth();

  return (
    <header className={cn('flex items-center justify-between gap-3 rounded-3xl border border-white/[0.07] bg-card/80 px-4 py-3.5 shadow-soft backdrop-blur-xl md:px-5', className)}>
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" className="lg:hidden" onClick={onMenuClick} aria-label="Abrir menú">
          <FiMenu size={16} aria-hidden="true" />
        </Button>
        <div>
          <p className="hidden text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground sm:block">Football Shop / Admin</p>
          <h1 className="text-lg font-bold tracking-tight">{titleFor(pathname)}</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {pathname !== '/products/new' && (
          <Button asChild size="sm">
            <Link to="/products/new">
              <FiPlus aria-hidden="true" /> <span className="hidden sm:inline">Crear producto</span>
            </Link>
          </Button>
        )}
        {/* Preparado para auth: solo aparece cuando haya un usuario en AuthContext */}
        {user && (
          <span className="flex items-center gap-2 rounded-xl bg-muted px-3 py-1.5 text-sm font-semibold">
            <FiUser aria-hidden="true" /> {user.name}
          </span>
        )}
      </div>
    </header>
  );
}
