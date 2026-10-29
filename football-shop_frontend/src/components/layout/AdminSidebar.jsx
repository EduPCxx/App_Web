import { NavLink } from 'react-router-dom';
import { IoFootballOutline } from 'react-icons/io5';
import { FiExternalLink } from 'react-icons/fi';
import { NAV_ITEMS } from '@/config/navigation';
import { API_DOCS_URL } from '@/config/env';
import { cn } from '@/utils/cn';

export default function AdminSidebar({ className, onNavigate }) {
  return (
    <aside className={cn('flex flex-col border-0 bg-transparent p-3.5 shadow-none', className)} aria-label="Menú lateral">
      <div className="mb-7 flex items-center gap-3 px-2 py-2">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-200 to-yellow-600 text-[#211b0d] shadow-[0_0_24px_-8px_rgba(217,172,73,0.75)]">
          <IoFootballOutline size={22} aria-hidden="true" />
        </span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/70">Football Shop</p>
          <p className="text-sm font-bold leading-tight tracking-tight">Admin Dashboard</p>
        </div>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto">
        {NAV_ITEMS.map((group) => (
          <div key={group.section} className="space-y-2.5">
            <p className="px-2 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">{group.section}</p>
            <div className="space-y-1">
              {group.items.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-sm font-medium transition-all',
                      isActive
                        ? 'bg-gradient-to-r from-amber-300/15 to-yellow-500/10 font-semibold text-amber-100 ring-1 ring-inset ring-amber-200/15 shadow-[0_8px_24px_-16px_rgba(217,172,73,0.65)]'
                        : 'text-muted-foreground hover:bg-amber-100/[0.04] hover:text-foreground'
                    )
                  }
                >
                  <Icon size={16} aria-hidden="true" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-4 border-t border-white/[0.08] pt-3">
        <a
          href={API_DOCS_URL}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-amber-100/[0.04] hover:text-foreground"
        >
          <FiExternalLink size={16} aria-hidden="true" />
          <span>Documentación API</span>
        </a>
      </div>
    </aside>
  );
}
