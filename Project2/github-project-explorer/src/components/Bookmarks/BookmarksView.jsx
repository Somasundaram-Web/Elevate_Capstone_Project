import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import RepoCard from '../Common/RepoCard';
import { EmptyState } from '../Common/ErrorAlert';
import NotesModal from './NotesModal';

const SORTS = {
  recent: { label: 'Recently saved', fn: (a, b) => new Date(b.savedAt) - new Date(a.savedAt) },
  stars: { label: 'Most stars', fn: (a, b) => b.stars - a.stars },
  name: { label: 'Name (A–Z)', fn: (a, b) => a.fullName.localeCompare(b.fullName) },
};

/** Bookmarked repositories with personal notes. Everything lives in localStorage. */
export default function BookmarksView() {
  const { bookmarks, removeBookmark, updateNote } = useApp();
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('recent');
  const [editing, setEditing] = useState(null);

  const visible = useMemo(() => {
    const term = filter.trim().toLowerCase();
    return bookmarks
      .filter(
        (b) =>
          !term ||
          b.fullName.toLowerCase().includes(term) ||
          b.description.toLowerCase().includes(term) ||
          (b.note || '').toLowerCase().includes(term) ||
          b.language.toLowerCase().includes(term)
      )
      .sort(SORTS[sort].fn);
  }, [bookmarks, filter, sort]);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(bookmarks, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'github-bookmarks.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="page-title">Bookmarks</h1>
          <p className="page-subtitle">
            {bookmarks.length} saved {bookmarks.length === 1 ? 'repository' : 'repositories'}, stored
            in this browser.
          </p>
        </div>
        {bookmarks.length > 0 && (
          <button type="button" className="btn" onClick={exportJson}>
            ⭳ Export JSON
          </button>
        )}
      </div>

      {bookmarks.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No bookmarks yet"
            message="Press “Save” on any repository to keep it here, then add your own notes."
          >
            <Link to="/explorer" className="btn btn-primary">
              Explore repositories
            </Link>
            <Link to="/trending" className="btn">
              See what’s trending
            </Link>
          </EmptyState>
        </div>
      ) : (
        <>
          <div className="card mt-5 flex flex-wrap items-end gap-3 p-4">
            <div className="min-w-[14rem] flex-1">
              <label htmlFor="bookmark-filter" className="mb-1 block text-xs font-medium text-slate-500">
                Filter bookmarks
              </label>
              <input
                id="bookmark-filter"
                type="search"
                className="input"
                placeholder="Search name, description, language or notes"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="bookmark-sort" className="mb-1 block text-xs font-medium text-slate-500">
                Sort by
              </label>
              <select
                id="bookmark-sort"
                className="input w-44"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                {Object.entries(SORTS).map(([key, { label }]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6">
            {visible.length === 0 ? (
              <EmptyState title="No matching bookmarks" message="Try a different search term." />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {visible.map((repo) => (
                  <RepoCard
                    key={repo.id}
                    repo={repo}
                    note={repo.note}
                    onEditNote={setEditing}
                    onRemove={(r) => removeBookmark(r.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {editing && (
        <NotesModal
          repo={editing}
          initialNote={bookmarks.find((b) => b.id === editing.id)?.note || ''}
          onSave={updateNote}
          onClose={() => setEditing(null)}
        />
      )}
    </section>
  );
}
