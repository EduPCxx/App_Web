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
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#d8b563]/50 bg-[#181818] text-[#f5d789] shadow-[0_16px_40px_-22px_rgba(216,181,99,0.7)]">
          <IoFootballOutline size={22} aria-hidden="true" />
        </span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">Football Shop</p>
          <p className="text-sm font-semibold leading-tight tracking-tight text-white">Admin dashboard</p>
        </div>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto">
        {NAV_ITEMS.map((group) => (
          <div key={group.section} className="space-y-2.5">
            <p className="px-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">{group.section}</p>
            <div className="space-y-1">
              {group.items.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
                      isActive
                        ? 'bg-[#1a1a1a] font-semibold text-white ring-1 ring-inset ring-white/10 shadow-[0_12px_30px_-20px_rgba(0,0,0,0.9)]'
                        : 'text-white/60 hover:bg-white/5 hover:text-white'
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

      <div className="mt-4 border-t border-white/10 pt-3">
        <a
          href={API_DOCS_URL}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-sm font-medium text-white/60 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-white/5 hover:text-white"
        >
          <FiExternalLink size={16} aria-hidden="true" />
          <span>Documentación API</span>
        </a>
      </div>
    </aside>
  );
}
