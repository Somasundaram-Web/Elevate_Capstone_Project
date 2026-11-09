import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { MAX_COMPARE, useApp } from '../../context/AppContext';
import { useGitHubApi } from '../../hooks/useGitHubApi';
import { getRepository, parseRepoInput } from '../../services/githubService';
import { EmptyState } from '../Common/ErrorAlert';
import {
  formatDate,
  formatNumber,
  formatSize,
  getLanguageColor,
  timeAgo,
} from '../../utils/formatters';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

/** `best` marks which numeric value is highlighted as the winner in that row. */
const ROWS = [
  { label: 'Stars', get: (r) => r.stars, show: (r) => formatNumber(r.stars), best: 'max' },
  { label: 'Forks', get: (r) => r.forks, show: (r) => formatNumber(r.forks), best: 'max' },
  { label: 'Open issues', get: (r) => r.openIssues, show: (r) => formatNumber(r.openIssues), best: 'min' },
  { label: 'Language', show: (r) => r.language || '—' },
  { label: 'License', show: (r) => r.license || '—' },
  { label: 'Size', show: (r) => formatSize(r.size) },
  { label: 'Created', show: (r) => formatDate(r.createdAt) },
  { label: 'Last push', show: (r) => timeAgo(r.pushedAt || r.updatedAt) },
  { label: 'Topics', show: (r) => (r.topics.length ? r.topics.slice(0, 5).join(', ') : '—') },
];

function winners(row, repos) {
  if (!row.best || repos.length < 2) return new Set();
  const values = repos.map(row.get);
  const target = row.best === 'max' ? Math.max(...values) : Math.min(...values);
  // Don't crown a winner when everyone is tied.
  if (values.every((v) => v === target)) return new Set();
  return new Set(repos.filter((r) => row.get(r) === target).map((r) => r.id));
}

export default function RepositoryCompare() {
  const { compareList, addToCompare, removeFromCompare, clearCompare } = useApp();
  const [input, setInput] = useState('');
  const [inputError, setInputError] = useState('');
  const { loading, error, execute } = useGitHubApi(getRepository);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!parseRepoInput(input)) {
      setInputError('Enter a repository as “owner/name” or paste its GitHub URL.');
      return;
    }
    setInputError('');
    const repo = await execute(input);
    if (repo && addToCompare(repo)) setInput('');
  };

  const chartData = useMemo(
    () => ({
      labels: compareList.map((r) => r.name),
      datasets: [
        { label: 'Stars', data: compareList.map((r) => r.stars), backgroundColor: '#6366f1' },
        { label: 'Forks', data: compareList.map((r) => r.forks), backgroundColor: '#f59e0b' },
      ],
    }),
    [compareList]
  );

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } },
      scales: {
        y: { beginAtZero: true, ticks: { callback: (v) => formatNumber(v) } },
      },
    }),
    []
  );

  const message = inputError || error;

  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="page-title">Compare</h1>
          <p className="page-subtitle">
            Compare up to {MAX_COMPARE} repositories side by side. Best values are highlighted.
          </p>
        </div>
        {compareList.length > 0 && (
          <button type="button" className="btn btn-danger" onClick={clearCompare}>
            Clear all
          </button>
        )}
      </div>

      <form onSubmit={handleAdd} className="card mt-5 flex flex-wrap items-start gap-3 p-4">
        <div className="min-w-[16rem] flex-1">
          <label htmlFor="compare-input" className="mb-1 block text-xs font-medium text-slate-500">
            Add by name or URL
          </label>
          <input
            id="compare-input"
            className="input"
            placeholder="facebook/react or https://github.com/vuejs/core"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setInputError('');
            }}
          />
          {message && (
            <p role="alert" className="mt-1 text-sm text-red-600">
              {message}
            </p>
          )}
        </div>
        <button
          type="submit"
          className="btn btn-primary mt-5"
          disabled={loading || !input.trim() || compareList.length >= MAX_COMPARE}
        >
          {loading ? 'Adding…' : 'Add repository'}
        </button>
      </form>

      {compareList.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="Nothing to compare yet"
            message="Add repositories above, or press “Compare” on any repository card in the Explorer."
          >
            <Link to="/explorer" className="btn btn-primary">
              Browse repositories
            </Link>
          </EmptyState>
        </div>
      ) : (
        <>
          <div className="card mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Metric
                  </th>
                  {compareList.map((repo) => (
                    <th key={repo.id} className="min-w-[11rem] px-4 py-3 align-top">
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block font-semibold text-indigo-700 hover:underline"
                      >
                        {repo.fullName}
                      </a>
                      <button
                        type="button"
                        className="mt-1 text-xs font-medium text-red-600 hover:underline"
                        onClick={() => removeFromCompare(repo.id)}
                      >
                        Remove
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ROWS.map((row) => {
                  const best = winners(row, compareList);
                  return (
                    <tr key={row.label}>
                      <th scope="row" className="whitespace-nowrap px-4 py-3 font-medium text-slate-600">
                        {row.label}
                      </th>
                      {compareList.map((repo) => (
                        <td
                          key={repo.id}
                          className={`px-4 py-3 ${
                            best.has(repo.id) ? 'font-semibold text-emerald-700' : 'text-slate-700'
                          }`}
                        >
                          {row.label === 'Language' && repo.language && (
                            <span
                              className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: getLanguageColor(repo.language) }}
                            />
                          )}
                          {row.show(repo)}
                          {best.has(repo.id) && <span className="ml-1.5" aria-label="best">▲</span>}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="card mt-6 p-4">
            <h2 className="mb-3 font-semibold text-slate-800">Stars &amp; forks</h2>
            <div className="h-72">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
        </>
      )}
    </section>
  );
}
