import { useCallback, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import Navbar from './components/Common/Navbar';
import Sidebar from './components/Common/Sidebar';
import Footer from './components/Common/Footer';
import { EmptyState } from './components/Common/ErrorAlert';
import DashboardOverview from './components/Dashboard/DashboardOverview';
import ExplorerView from './components/Explorer/ExplorerView';
import TrendingView from './components/Trending/TrendingView';
import RepositoryCompare from './components/Comparison/RepositoryCompare';
import BookmarksView from './components/Bookmarks/BookmarksView';
import { useApp } from './context/AppContext';

function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  const color =
    toast.type === 'success'
      ? 'bg-emerald-600'
      : toast.type === 'error'
        ? 'bg-red-600'
        : 'bg-slate-800';
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-lg ${color}`}
    >
      {toast.message}
    </div>
  );
}

function NotFound() {
  return (
    <EmptyState title="Page not found" message="The page you are looking for does not exist.">
      <Link to="/" className="btn btn-primary">
        Back to dashboard
      </Link>
    </EmptyState>
  );
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar onMenuClick={() => setMenuOpen(true)} />
      <Sidebar open={menuOpen} onClose={closeMenu} />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <Routes>
          <Route path="/" element={<DashboardOverview />} />
          <Route path="/explorer" element={<ExplorerView />} />
          <Route path="/trending" element={<TrendingView />} />
          <Route path="/compare" element={<RepositoryCompare />} />
          <Route path="/bookmarks" element={<BookmarksView />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
      <Toast />
    </div>
  );
}
