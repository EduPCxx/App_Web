import { NavLink, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="container nav-wrap">
          <NavLink to="/products" className="brand">⚽ Football Products</NavLink>
          <nav className="nav-links">
            <NavLink to="/products" end>Productos</NavLink>
            <NavLink to="/products/new" className="button button-small">+ Nuevo</NavLink>
          </nav>
        </div>
      </header>
      <main className="container main-content">
        <Outlet />
      </main>
    </div>
  );
}
