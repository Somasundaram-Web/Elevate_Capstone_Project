import { useEffect, useRef, useState } from 'react';

/**
 * Search input with debouncing: `onSearch` fires once the user pauses typing
 * (default 500 ms) or immediately when they press Enter.
 */
export default function SearchBar({
  value,
  onSearch,
  delay = 500,
  placeholder = 'Search repositories (e.g. "react state management")',
}) {
  const [text, setText] = useState(value);
  const onSearchRef = useRef(onSearch);
  const textRef = useRef(text);
  onSearchRef.current = onSearch;
  textRef.current = text;

  // Keep the box in sync if the parent changes the value (without clobbering
  // what the user is typing, e.g. a trailing space).
  useEffect(() => {
    if (textRef.current.trim() !== value) setText(value);
  }, [value]);

  useEffect(() => {
    if (text.trim() === value) return undefined;
    const timer = setTimeout(() => onSearchRef.current(text.trim()), delay);
    return () => clearTimeout(timer);
  }, [text, value, delay]);

  const submit = (e) => {
    e.preventDefault();
    if (text.trim() !== value) onSearch(text.trim());
  };

  return (
    <form onSubmit={submit} className="relative" role="search">
      <label htmlFor="repo-search" className="sr-only">
        Search repositories
      </label>
      <input
        id="repo-search"
        type="search"
        className="input pr-20"
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        autoComplete="off"
      />
      {text && (
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100"
          onClick={() => {
            setText('');
            onSearch('');
          }}
        >
          Clear
        </button>
      )}
    </form>
  );
}
