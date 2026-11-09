import { useApp } from '../../context/AppContext';
import {
  formatNumber,
  getLanguageColor,
  timeAgo,
  truncate,
} from '../../utils/formatters';

/** Bookmark + Compare buttons, reused by the card and the table view. */
export function RepoActions({ repo, compact = false }) {
  const { isBookmarked, toggleBookmark, isInCompare, toggleCompare } = useApp();
  const saved = isBookmarked(repo.id);
  const comparing = isInCompare(repo.id);
  const size = compact ? 'px-2 py-1 text-xs' : '';

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className={`btn ${size} ${saved ? 'btn-active' : ''}`}
        onClick={() => toggleBookmark(repo)}
        aria-pressed={saved}
        title={saved ? 'Remove bookmark' : 'Bookmark this repository'}
      >
        {saved ? '★ Saved' : '☆ Save'}
      </button>
      <button
        type="button"
        className={`btn ${size} ${comparing ? 'btn-primary' : ''}`}
        onClick={() => toggleCompare(repo)}
        aria-pressed={comparing}
        title={comparing ? 'Remove from comparison' : 'Add to comparison'}
      >
        {comparing ? '✓ Comparing' : '⇄ Compare'}
      </button>
    </div>
  );
}

export function LanguageDot({ language }) {
  if (!language) return null;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="h-3 w-3 rounded-full"
        style={{ backgroundColor: getLanguageColor(language) }}
      />
      {language}
    </span>
  );
}

/** Card for one repository. `note` / `onEditNote` are used by the Bookmarks page. */
export default function RepoCard({ repo, note, onEditNote, onRemove }) {
  return (
    <article className="card flex h-full flex-col p-4 transition hover:shadow-md">
      <header className="flex items-start gap-3">
        {repo.avatar && (
          <img
            src={repo.avatar}
            alt=""
            loading="lazy"
            className="h-10 w-10 shrink-0 rounded-full border border-slate-200"
          />
        )}
        <div className="min-w-0">
          <a
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block truncate font-semibold text-indigo-700 hover:underline"
            title={repo.fullName}
          >
            {repo.fullName}
          </a>
          <p className="text-xs text-slate-500">Updated {timeAgo(repo.pushedAt || repo.updatedAt)}</p>
        </div>
      </header>

      <p className="mt-3 flex-1 text-sm text-slate-600">
        {repo.description ? truncate(repo.description, 140) : 'No description provided.'}
      </p>

      {repo.topics?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {repo.topics.slice(0, 4).map((topic) => (
            <span
              key={topic}
              className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700"
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      {note && (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-2 text-sm text-amber-900">
          <span className="font-semibold">Note: </span>
          {truncate(note, 160)}
        </p>
      )}

      <dl className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
        <div className="flex items-center gap-1" title="Stars">
          <dt className="sr-only">Stars</dt>
          <dd>★ {formatNumber(repo.stars)}</dd>
        </div>
        <div className="flex items-center gap-1" title="Forks">
          <dt className="sr-only">Forks</dt>
          <dd>⑂ {formatNumber(repo.forks)}</dd>
        </div>
        <div className="flex items-center gap-1" title="Open issues">
          <dt className="sr-only">Open issues</dt>
          <dd>● {formatNumber(repo.openIssues)} issues</dd>
        </div>
        <div className="text-slate-600">
          <LanguageDot language={repo.language} />
        </div>
      </dl>

      <footer className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
        <RepoActions repo={repo} compact />
        {onEditNote && (
          <button type="button" className="btn px-2 py-1 text-xs" onClick={() => onEditNote(repo)}>
            ✎ {note ? 'Edit note' : 'Add note'}
          </button>
        )}
        {onRemove && (
          <button type="button" className="btn btn-danger px-2 py-1 text-xs" onClick={() => onRemove(repo)}>
            Remove
          </button>
        )}
      </footer>
    </article>
  );
}
