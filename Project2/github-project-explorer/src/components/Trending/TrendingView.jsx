import { useEffect, useState } from 'react';
import RepositoryList from '../Explorer/RepositoryList';
import { LANGUAGES } from '../Explorer/FilterSortBar';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorAlert from '../Common/ErrorAlert';
import Pagination from '../Common/Pagination';
import { useGitHubApi } from '../../hooks/useGitHubApi';
import { getTrendingRepositories } from '../../services/githubService';

const PERIODS = [
  { days: 7, label: 'This week' },
  { days: 30, label: 'This month' },
  { days: 90, label: 'Last 3 months' },
];

const PER_PAGE = 12;
const MAX_RESULTS = 1000;

/**
 * "Trending" = the most-starred repositories created recently.
 * (GitHub has no official trending endpoint, so this uses the search API.)
 */
export default function TrendingView() {
  const [days, setDays] = useState(7);
  const [language, setLanguage] = useState('');
  const [page, setPage] = useState(1);
  const { data, loading, error, execute } = useGitHubApi(getTrendingRepositories);

  useEffect(() => {
    execute({ days, language, page, perPage: PER_PAGE });
  }, [days, language, page, execute]);

  const total = data?.total || 0;
  const totalPages = Math.ceil(Math.min(total, MAX_RESULTS) / PER_PAGE);

  return (
    <section>
      <h1 className="page-title">Trending</h1>
      <p className="page-subtitle">
        Newly created repositories that are gaining stars the fastest.
      </p>

      <div className="card mt-5 flex flex-wrap items-end gap-4 p-4">
        <div>
          <span className="mb-1 block text-xs font-medium text-slate-500">Created</span>
          <div className="inline-flex overflow-hidden rounded-lg border border-slate-300" role="group">
            {PERIODS.map((p) => (
              <button
                key={p.days}
                type="button"
                aria-pressed={days === p.days}
                onClick={() => {
                  setDays(p.days);
                  setPage(1);
                }}
                className={`px-3 py-2 text-sm font-medium ${
                  days === p.days
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="trending-language" className="mb-1 block text-xs font-medium text-slate-500">
            Language
          </label>
          <select
            id="trending-language"
            className="input w-44"
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All languages</option>
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6">
        {loading && <LoadingSpinner label="Finding trending repositories…" />}

        {!loading && error && (
          <ErrorAlert
            title="Could not load trending repositories"
            message={error}
            onRetry={() => execute({ days, language, page, perPage: PER_PAGE })}
          />
        )}

        {!loading && !error && data && (
          <>
            <RepositoryList
              repos={data.items}
              emptyTitle="Nothing trending here yet"
              emptyMessage="No new repositories matched. Try a longer period or another language."
            />
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={(p) => {
                setPage(p);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </>
        )}
      </div>
    </section>
  );
}
