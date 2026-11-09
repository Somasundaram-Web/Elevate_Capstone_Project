import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const STORAGE_KEYS = {
  bookmarks: 'gpe:bookmarks',
  compare: 'gpe:compare',
};

export const MAX_COMPARE = 4;

function load(key) {
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function save(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage may be full or disabled - the app still works in memory */
  }
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [bookmarks, setBookmarks] = useState(() => load(STORAGE_KEYS.bookmarks));
  const [compareList, setCompareList] = useState(() => load(STORAGE_KEYS.compare));
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  useEffect(() => save(STORAGE_KEYS.bookmarks, bookmarks), [bookmarks]);
  useEffect(() => save(STORAGE_KEYS.compare, compareList), [compareList]);
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const showToast = useCallback((message, type = 'info') => {
    clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  /* ---------------------------- bookmarks ---------------------------- */

  const isBookmarked = useCallback(
    (id) => bookmarks.some((b) => b.id === id),
    [bookmarks]
  );

  const toggleBookmark = useCallback(
    (repo) => {
      const exists = bookmarks.some((b) => b.id === repo.id);
      if (exists) {
        setBookmarks((prev) => prev.filter((b) => b.id !== repo.id));
        showToast(`Removed ${repo.fullName} from bookmarks`);
      } else {
        setBookmarks((prev) => [
          { ...repo, note: '', savedAt: new Date().toISOString() },
          ...prev,
        ]);
        showToast(`Bookmarked ${repo.fullName}`, 'success');
      }
    },
    [bookmarks, showToast]
  );

  const removeBookmark = useCallback(
    (id) => {
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
      showToast('Bookmark removed');
    },
    [showToast]
  );

  const updateNote = useCallback(
    (id, note) => {
      setBookmarks((prev) => prev.map((b) => (b.id === id ? { ...b, note } : b)));
      showToast('Note saved', 'success');
    },
    [showToast]
  );

  /* ----------------------------- compare ----------------------------- */

  const isInCompare = useCallback(
    (id) => compareList.some((r) => r.id === id),
    [compareList]
  );

  const addToCompare = useCallback(
    (repo) => {
      if (compareList.some((r) => r.id === repo.id)) {
        showToast(`${repo.fullName} is already in the comparison`);
        return false;
      }
      if (compareList.length >= MAX_COMPARE) {
        showToast(`You can compare up to ${MAX_COMPARE} repositories`, 'error');
        return false;
      }
      setCompareList((prev) => [...prev, repo]);
      showToast(`Added ${repo.fullName} to comparison`, 'success');
      return true;
    },
    [compareList, showToast]
  );

  const removeFromCompare = useCallback((id) => {
    setCompareList((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const toggleCompare = useCallback(
    (repo) => {
      if (compareList.some((r) => r.id === repo.id)) {
        removeFromCompare(repo.id);
        showToast(`Removed ${repo.fullName} from comparison`);
      } else {
        addToCompare(repo);
      }
    },
    [compareList, addToCompare, removeFromCompare, showToast]
  );

  const clearCompare = useCallback(() => setCompareList([]), []);

  const value = useMemo(
    () => ({
      bookmarks,
      isBookmarked,
      toggleBookmark,
      removeBookmark,
      updateNote,
      compareList,
      isInCompare,
      addToCompare,
      removeFromCompare,
      toggleCompare,
      clearCompare,
      toast,
      showToast,
    }),
    [
      bookmarks,
      isBookmarked,
      toggleBookmark,
      removeBookmark,
      updateNote,
      compareList,
      isInCompare,
      addToCompare,
      removeFromCompare,
      toggleCompare,
      clearCompare,
      toast,
      showToast,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
