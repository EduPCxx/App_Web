import { Suspense, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '@/components/layout/AdminSidebar';
import Navbar from '@/components/layout/Navbar';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { PageSkeleton } from '@/components/common/Skeletons';

export default function MainLayout() {
  const { pathname } = useLocation();
  const isDashboard = pathname === '/';
  const isCatalogSection = pathname.startsWith('/products');
  const usesFullLayout = isDashboard || isCatalogSection;
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
    <div className={usesFullLayout ? 'min-h-screen' : 'min-h-screen p-3 md:p-5'}>
      <div
        className={`grid w-full ${
          usesFullLayout
            ? 'min-h-screen gap-0 lg:grid-cols-[224px_minmax(0,1fr)]'
            : 'mx-auto max-w-[1440px] gap-4 lg:grid-cols-[260px_minmax(0,1fr)] xl:gap-5'
        }`}
      >
        <AdminSidebar
          className={`hidden lg:sticky lg:flex ${
            usesFullLayout
              ? 'lg:top-0 lg:h-screen lg:border-r lg:border-white/[0.08] lg:px-4 lg:py-5'
              : 'lg:top-5 lg:h-[calc(100vh-2.5rem)]'
          }`}
        />

        <div className={usesFullLayout ? 'min-w-0' : 'min-w-0 space-y-4 xl:space-y-5'}>
          <Navbar onMenuClick={() => setMenuOpen(true)} className={usesFullLayout ? 'mb-3 p-3 lg:hidden' : ''} />

          <main
            className={
              usesFullLayout
                ? 'page-enter min-h-screen border-0 bg-transparent p-0 shadow-none'
                : 'page-enter min-h-[calc(100vh-7rem)] rounded-3xl border bg-card/75 p-4 shadow-soft backdrop-blur-xl md:p-6 xl:p-8'
            }
          >
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
