import { useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useRateLimit } from '../../hooks/useGitHubApi';
import { fetchRateLimit, hasToken } from '../../services/githubService';

export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/explorer', label: 'Explorer' },
  { to: '/trending', label: 'Trending' },
  { to: '/compare', label: 'Compare', badge: 'compare' },
  { to: '/bookmarks', label: 'Bookmarks', badge: 'bookmarks' },
];

function RateLimitBadge() {
  const { limit, remaining, reset } = useRateLimit();

  useEffect(() => {
    // Initial read; this endpoint does not count against the quota.
    fetchRateLimit().catch(() => {});
  }, []);

  if (limit === null) return null;

  const low = remaining <= Math.max(2, limit * 0.1);
  const title = `GitHub API requests left${
    reset ? ` (resets ${new Date(reset).toLocaleTimeString()})` : ''
  }${hasToken ? ' - using access token' : ' - no token (60/hour). Add one in .env'}`;

  return (
    <span
      title={title}
      className={`hidden rounded-full px-2.5 py-1 text-xs font-medium sm:inline-block ${
        low ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
      }`}
    >
      API {remaining}/{limit}
    </span>
  );
}

export default function Navbar({ onMenuClick }) {
  const { bookmarks, compareList } = useApp();
  const counts = { bookmarks: bookmarks.length, compare: compareList.length };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
        <button
          type="button"
          className="btn px-2 md:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          ☰
        </button>

        <Link to="/" className="flex items-center gap-2 font-bold text-slate-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs text-white">
            GP
          </span>
          <span className="hidden sm:inline">GitHub Project Explorer</span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              {item.label}
              {item.badge && counts[item.badge] > 0 && (
                <span className="ml-1.5 rounded-full bg-indigo-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {counts[item.badge]}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto">
          <RateLimitBadge />
        </div>
      </div>
    </header>
  );
}
