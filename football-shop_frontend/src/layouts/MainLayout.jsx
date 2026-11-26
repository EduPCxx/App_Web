import { Suspense, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '@/components/layout/AdminSidebar';
import Navbar from '@/components/layout/Navbar';
import ProfileShortcut from '@/components/layout/ProfileShortcut';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { PageSkeleton } from '@/components/common/Skeletons';
import { useAuth } from '@/hooks/useAuth';
import { apiService } from '@/services/apiService';
import { notifyError } from '@/utils/alerts';

export default function MainLayout() {
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const isDashboard = pathname === '/admin';
  const isCatalogSection = ['/products', '/categories', '/brands', '/variants', '/images', '/roles', '/users', '/profile'].some((path) =>
    pathname.startsWith(path)
  );
  const usesFullLayout = isDashboard || isCatalogSection;
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      if (error?.code !== 'TOKEN_REVOKED') {
        await notifyError(error, 'No se pudo cerrar la sesión');
      }
    } finally {
      logout();
    }
  };

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
        className={`mx-auto grid w-full ${
          usesFullLayout
            ? 'max-w-[1600px] min-h-screen gap-0 lg:grid-cols-[224px_minmax(0,1fr)]'
            : 'max-w-[1440px] gap-4 lg:grid-cols-[260px_minmax(0,1fr)] xl:gap-5'
        }`}
      >
        <AdminSidebar
          onLogout={handleLogout}
          className={`hidden lg:sticky lg:flex ${
            usesFullLayout
              ? 'lg:top-0 lg:h-screen lg:border-r lg:border-white/10 lg:bg-[#111111] lg:px-4 lg:py-5'
              : 'lg:top-5 lg:h-[calc(100vh-2.5rem)]'
          }`}
        />

        <div className={usesFullLayout ? 'min-w-0' : 'min-w-0 space-y-4 xl:space-y-5'}>
          <Navbar onMenuClick={() => setMenuOpen(true)} onLogout={handleLogout} className={usesFullLayout ? 'mb-3 p-3 lg:hidden' : ''} />

          <div className="mb-2 flex justify-end px-4 pt-2 sm:px-6 lg:px-7">
            <ProfileShortcut />
          </div>

          <main
            className={
              usesFullLayout
                ? 'page-enter min-h-screen border-0 bg-transparent p-0 shadow-none'
                : 'page-enter min-h-[calc(100vh-7rem)] rounded-3xl border border-white/10 bg-[#101010] p-4 shadow-soft md:p-6 xl:p-8'
            }
          >
            <ErrorBoundary resetKey={pathname}>
              <Suspense fallback={<PageSkeleton />}>
                <Outlet />
              </Suspense>
            </ErrorBoundary>
          </main>
        </div>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menú">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMenuOpen(false)} aria-hidden="true" />
          <AdminSidebar className="absolute inset-y-3 left-3 w-72 max-w-[85vw] rounded-3xl border border-white/10 bg-[#111111] p-3.5 shadow-soft" onNavigate={() => setMenuOpen(false)} />
        </div>
      )}
    </div>
  );
}
