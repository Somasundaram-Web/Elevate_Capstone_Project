import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { NAV_ITEMS } from './Navbar';

/** Mobile slide-in menu (hidden on md+ screens where the Navbar links show). */
export default function Sidebar({ open, onClose }) {
  const { bookmarks, compareList } = useApp();
  const counts = { bookmarks: bookmarks.length, compare: compareList.length };

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
      <aside className="absolute left-0 top-0 h-full w-64 bg-white p-4 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <span className="font-bold text-slate-900">Menu</span>
          <button type="button" className="btn px-2" onClick={onClose} aria-label="Close menu">
            ✕
          </button>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-100'
                }`
              }
            >
              {item.label}
              {item.badge && counts[item.badge] > 0 && (
                <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs text-white">
                  {counts[item.badge]}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
    </div>
  );
}
