import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AnalyticsCharts from './AnalyticsCharts';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorAlert, { EmptyState } from '../Common/ErrorAlert';
import { useApp } from '../../context/AppContext';
import { useGitHubApi } from '../../hooks/useGitHubApi';
import { searchRepositories } from '../../services/githubService';
import { formatNumber } from '../../utils/formatters';

const SOURCES = [
  { id: 'top', label: 'Top repositories' },
  { id: 'bookmarks', label: 'My bookmarks' },
];

function StatCard({ label, value, hint }) {
  return (
    <div className="card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function topLanguage(repos) {
  const counts = {};
  repos.forEach((r) => {
    if (r.language) counts[r.language] = (counts[r.language] || 0) + 1;
  });
  const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return best ? best[0] : '—';
}

/** Landing page: summary cards + charts for the most-starred repos or your bookmarks. */
export default function DashboardOverview() {
  const { bookmarks, compareList } = useApp();
  const [source, setSource] = useState('top');
  const { data, loading, error, execute } = useGitHubApi(searchRepositories);

  const load = () => execute({ sort: 'stars', order: 'desc', perPage: 30 });

  useEffect(() => {
    execute({ sort: 'stars', order: 'desc', perPage: 30 });
  }, [execute]);

  const repos = source === 'top' ? data?.items || [] : bookmarks;

  const stats = useMemo(() => {
    const totalStars = repos.reduce((sum, r) => sum + r.stars, 0);
    const totalForks = repos.reduce((sum, r) => sum + r.forks, 0);
    return {
      count: repos.length,
      totalStars,
      totalForks,
      avgStars: repos.length ? Math.round(totalStars / repos.length) : 0,
      language: topLanguage(repos),
    };
  }, [repos]);

  const showTopStatus = source === 'top';

  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            A quick look at the open-source landscape and the repositories you care about.
          </p>
        </div>
        <div className="inline-flex overflow-hidden rounded-lg border border-slate-300" role="group" aria-label="Data source">
          {SOURCES.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={source === s.id}
              onClick={() => setSource(s.id)}
              className={`px-3 py-2 text-sm font-medium ${
                source === s.id ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Repositories analyzed"
          value={stats.count}
          hint={source === 'top' ? 'Top 30 by stars' : 'Saved by you'}
        />
        <StatCard label="Total stars" value={formatNumber(stats.totalStars)} hint={`${formatNumber(stats.avgStars)} on average`} />
        <StatCard label="Total forks" value={formatNumber(stats.totalForks)} />
        <StatCard label="Most common language" value={stats.language} />
      </div>

      <div className="mt-6">
        {showTopStatus && loading && <LoadingSpinner label="Loading dashboard data…" />}

        {showTopStatus && !loading && error && (
          <ErrorAlert title="Could not load dashboard data" message={error} onRetry={load} />
        )}

        {!(showTopStatus && (loading || error)) &&
          (repos.length > 0 ? (
            <AnalyticsCharts repos={repos} />
          ) : (
            <EmptyState
              title={source === 'bookmarks' ? 'No bookmarks to analyze' : 'No data yet'}
              message="Bookmark repositories in the Explorer and their analytics will show up here."
            >
              <Link to="/explorer" className="btn btn-primary">
                Open Explorer
              </Link>
            </EmptyState>
          ))}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Link to="/trending" className="card p-4 transition hover:shadow-md">
          <p className="font-semibold text-slate-900">🔥 Trending</p>
          <p className="mt-1 text-sm text-slate-500">See which new projects are taking off.</p>
        </Link>
        <Link to="/compare" className="card p-4 transition hover:shadow-md">
          <p className="font-semibold text-slate-900">⇄ Compare</p>
          <p className="mt-1 text-sm text-slate-500">
            {compareList.length > 0
              ? `${compareList.length} repositories ready to compare.`
              : 'Put repositories side by side.'}
          </p>
        </Link>
        <Link to="/bookmarks" className="card p-4 transition hover:shadow-md">
          <p className="font-semibold text-slate-900">★ Bookmarks</p>
          <p className="mt-1 text-sm text-slate-500">
            {bookmarks.length > 0
              ? `${bookmarks.length} saved with your notes.`
              : 'Save projects and add notes.'}
          </p>
        </Link>
      </div>
    </section>
  );
}
