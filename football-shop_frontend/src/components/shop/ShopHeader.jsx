import { Link } from 'react-router-dom';
import { FiShoppingBag } from 'react-icons/fi';

/**
 * @param {{ compact?: boolean }} props
 */
export default function ShopHeader({ compact = false }) {
  return (
    <header className="border-b border-white/10 bg-[#101011]/95">
      <div className={`mx-auto flex max-w-[1440px] items-center justify-between px-5 ${compact ? 'py-4' : 'py-5'}`}>
        <Link to="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[hsl(var(--gold))] text-black">
            <FiShoppingBag aria-hidden="true" />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[hsl(var(--gold))]">Football</p>
            <p className="text-lg font-bold leading-tight">Shop</p>
          </div>
        </Link>
        <nav className="flex items-center gap-5 text-sm text-white/65" aria-label="Navegación principal">
          <Link to="/shop" className="hover:text-white">Tienda</Link>
          <Link to="/login" className="hover:text-white">Acceso</Link>
        </nav>
      </div>
    </header>
  );
}
