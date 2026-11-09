import { useState } from 'react';
import RepoCard, { LanguageDot, RepoActions } from '../Common/RepoCard';
import { EmptyState } from '../Common/ErrorAlert';
import { formatNumber, timeAgo, truncate } from '../../utils/formatters';

/** Presentational list of repositories with a Cards / Table view toggle. */
export default function RepositoryList({
  repos,
  emptyTitle = 'No repositories found',
  emptyMessage = 'Try different keywords or remove some filters.',
}) {
  const [view, setView] = useState('cards');

  if (!repos || repos.length === 0) {
    return <EmptyState title={emptyTitle} message={emptyMessage} />;
  }

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <div className="inline-flex overflow-hidden rounded-lg border border-slate-300" role="group" aria-label="View mode">
          {['cards', 'table'].map((mode) => (
            <button
              key={mode}
              type="button"
              aria-pressed={view === mode}
              onClick={() => setView(mode)}
              className={`px-3 py-1.5 text-sm font-medium capitalize ${
                view === mode ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {view === 'cards' ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {repos.map((repo) => (
            <RepoCard key={repo.id} repo={repo} />
          ))}
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Repository</th>
                <th className="px-4 py-3">Language</th>
                <th className="px-4 py-3 text-right">Stars</th>
                <th className="px-4 py-3 text-right">Forks</th>
                <th className="px-4 py-3 text-right">Issues</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {repos.map((repo) => (
                <tr key={repo.id} className="hover:bg-slate-50">
                  <td className="max-w-xs px-4 py-3">
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-indigo-700 hover:underline"
                    >
                      {repo.fullName}
                    </a>
                    <p className="text-xs text-slate-500">{truncate(repo.description, 80)}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <LanguageDot language={repo.language} />
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatNumber(repo.stars)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatNumber(repo.forks)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatNumber(repo.openIssues)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                    {timeAgo(repo.pushedAt || repo.updatedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <RepoActions repo={repo} compact />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
