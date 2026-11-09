import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>
          <span className="font-semibold text-slate-700">GitHub Project Explorer</span> · Data from
          the GitHub REST API
        </p>
        <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Footer">
          <Link className="hover:text-indigo-600" to="/explorer">
            Explorer
          </Link>
          <Link className="hover:text-indigo-600" to="/trending">
            Trending
          </Link>
          <Link className="hover:text-indigo-600" to="/compare">
            Compare
          </Link>
          <Link className="hover:text-indigo-600" to="/bookmarks">
            Bookmarks
          </Link>
          <a
            className="hover:text-indigo-600"
            href="https://docs.github.com/en/rest"
            target="_blank"
            rel="noopener noreferrer"
          >
            API docs
          </a>
          <a
            className="hover:text-indigo-600"
            href="https://github.com/settings/tokens"
            target="_blank"
            rel="noopener noreferrer"
          >
            Get a token
          </a>
        </nav>
      </div>
    </footer>
  );
}
