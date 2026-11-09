import { useEffect, useState } from 'react';
import SearchBar from './SearchBar';
import FilterSortBar from './FilterSortBar';
import RepositoryList from './RepositoryList';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorAlert from '../Common/ErrorAlert';
import Pagination from '../Common/Pagination';
import { useGitHubApi } from '../../hooks/useGitHubApi';
import { searchRepositories } from '../../services/githubService';
import { formatNumber } from '../../utils/formatters';

const PER_PAGE = 12;
const MAX_RESULTS = 1000; // GitHub's search API only exposes the first 1,000 hits

/** Explorer page: search + filter + sort + paginate GitHub repositories. */
export default function ExplorerView() {
  const [filters, setFilters] = useState({
    query: '',
    language: '',
    sort: 'stars',
    order: 'desc',
  });
  const [page, setPage] = useState(1);
  const { data, loading, error, execute } = useGitHubApi(searchRepositories);

  useEffect(() => {
    execute({ ...filters, page, perPage: PER_PAGE });
  }, [filters, page, execute]);

  const updateFilters = (partial) => {
    setFilters((prev) => ({ ...prev, ...partial }));
    setPage(1);
  };

  const total = data?.total || 0;
  const totalPages = Math.ceil(Math.min(total, MAX_RESULTS) / PER_PAGE);

  const changePage = (next) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section>
      <h1 className="page-title">Explorer</h1>
      <p className="page-subtitle">
        Search millions of open-source repositories. Save the interesting ones or add them to a
        comparison.
      </p>

      <div className="card mt-5 space-y-4 p-4">
        <SearchBar value={filters.query} onSearch={(query) => updateFilters({ query })} />
        <FilterSortBar filters={filters} onChange={updateFilters} />
      </div>

      <div className="mt-6">
        {data && !error && (
          <p className="mb-3 text-sm text-slate-500">
            <span className="font-semibold text-slate-700">{formatNumber(total)}</span>{' '}
            repositories found
            {total > MAX_RESULTS && ' (GitHub shows the first 1,000)'}
          </p>
        )}

        {loading && <LoadingSpinner label="Searching GitHub…" />}

        {!loading && error && (
          <ErrorAlert
            title="Could not load repositories"
            message={error}
            onRetry={() => execute({ ...filters, page, perPage: PER_PAGE })}
          />
        )}

        {!loading && !error && data && (
          <>
            <RepositoryList repos={data.items} />
            <Pagination page={page} totalPages={totalPages} onPageChange={changePage} />
          </>
        )}
      </div>
    </section>
  );
}
