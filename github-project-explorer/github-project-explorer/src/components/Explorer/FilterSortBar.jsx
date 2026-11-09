export const LANGUAGES = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'Go',
  'Rust',
  'C',
  'C++',
  'C#',
  'PHP',
  'Ruby',
  'Swift',
  'Kotlin',
  'Dart',
  'Shell',
  'Scala',
  'Vue',
  'HTML',
  'CSS',
];

export const SORT_OPTIONS = [
  { value: 'stars', label: 'Most stars' },
  { value: 'forks', label: 'Most forks' },
  { value: 'updated', label: 'Recently updated' },
  { value: 'help-wanted-issues', label: 'Help-wanted issues' },
  { value: 'best-match', label: 'Best match' },
];

/** Language filter + sort selectors. `onChange` receives a partial filters object. */
export default function FilterSortBar({ filters, onChange }) {
  const bestMatch = filters.sort === 'best-match';

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label htmlFor="filter-language" className="mb-1 block text-xs font-medium text-slate-500">
          Language
        </label>
        <select
          id="filter-language"
          className="input w-44"
          value={filters.language}
          onChange={(e) => onChange({ language: e.target.value })}
        >
          <option value="">All languages</option>
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filter-sort" className="mb-1 block text-xs font-medium text-slate-500">
          Sort by
        </label>
        <select
          id="filter-sort"
          className="input w-48"
          value={filters.sort}
          onChange={(e) => onChange({ sort: e.target.value })}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        className="btn h-[38px]"
        disabled={bestMatch}
        onClick={() => onChange({ order: filters.order === 'desc' ? 'asc' : 'desc' })}
        title="Toggle sort direction"
      >
        {filters.order === 'desc' ? '↓ Descending' : '↑ Ascending'}
      </button>
    </div>
  );
}
