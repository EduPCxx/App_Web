import { NavLink } from 'react-router-dom';
import { IoFootballOutline } from 'react-icons/io5';
import { FiExternalLink } from 'react-icons/fi';
import { NAV_ITEMS } from '@/config/navigation';
import { API_DOCS_URL } from '@/config/env';
import { cn } from '@/utils/cn';

export default function AdminSidebar({ className, onNavigate }) {
  return (
    <aside className={cn('flex flex-col rounded-2xl border bg-card p-3 shadow-soft', className)} aria-label="Menú lateral">
      <div className="mb-4 flex items-center gap-3 px-3 py-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <IoFootballOutline size={22} aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">Football Shop</p>
          <p className="text-lg font-bold leading-tight">Admin Dashboard</p>
        </div>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto">
        {NAV_ITEMS.map((group) => (
          <div key={group.section} className="space-y-2">
            <p className="px-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{group.section}</p>
            <div className="space-y-1">
              {group.items.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                      isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
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

      <div className="mt-4 border-t pt-3">
        <a
          href={API_DOCS_URL}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <FiExternalLink size={16} aria-hidden="true" />
          <span>Documentación API</span>
        </a>
      </div>
    </aside>
  );
}
