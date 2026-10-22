import { Suspense, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '@/components/layout/AdminSidebar';
import Navbar from '@/components/layout/Navbar';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { PageSkeleton } from '@/components/common/Skeletons';

export default function MainLayout() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // El menú móvil se cierra al navegar y con Escape
  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKeyDown = (event) => event.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  return (
    <div className="min-h-screen p-3 md:p-4">
      <div className="mx-auto grid w-full max-w-7xl gap-4 lg:grid-cols-[260px_1fr]">
        <AdminSidebar className="hidden lg:sticky lg:top-4 lg:flex lg:h-[calc(100vh-2rem)]" />

        <div className="min-w-0 space-y-4">
          <Navbar onMenuClick={() => setMenuOpen(true)} />

          <main className="page-enter rounded-2xl border bg-card/80 p-4 shadow-soft md:p-6">
            <ErrorBoundary resetKey={pathname}>
              {/* Suspense dentro del layout: sidebar y navbar no desaparecen al cargar una página lazy */}
              <Suspense fallback={<PageSkeleton />}>
                <Outlet />
              </Suspense>
            </ErrorBoundary>
          </main>
        </div>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menú">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setMenuOpen(false)} aria-hidden="true" />
          <AdminSidebar className="absolute inset-y-3 left-3 w-72 max-w-[85vw]" onNavigate={() => setMenuOpen(false)} />
        </div>
      )}
    </div>
  );
}
