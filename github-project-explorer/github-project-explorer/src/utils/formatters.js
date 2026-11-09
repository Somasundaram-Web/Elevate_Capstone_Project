/**
 * Formatting helpers shared across the app.
 */

const UNITS = [
  { value: 1e9, suffix: 'B' },
  { value: 1e6, suffix: 'M' },
  { value: 1e3, suffix: 'k' },
];

/** 1234 -> "1.2k", 1500000 -> "1.5M", 999999 -> "1M" */
export function formatNumber(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '0';
  const abs = Math.abs(n);
  if (abs < 1000) return String(n);

  let idx = UNITS.findIndex((u) => abs >= u.value);
  let rounded = Math.round((n / UNITS[idx].value) * 10) / 10;
  // e.g. 999,999 rounds to "1000k" -> promote to "1M"
  if (Math.abs(rounded) >= 1000 && idx > 0) {
    idx -= 1;
    rounded = Math.round((n / UNITS[idx].value) * 10) / 10;
  }
  return `${rounded}${UNITS[idx].suffix}`;
}

/** ISO string -> "Mar 4, 2024" */
export function formatDate(iso) {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** ISO string -> "3 days ago" */
export function timeAgo(iso, now = Date.now()) {
  if (!iso) return '—';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '—';
  const seconds = Math.max(0, Math.floor((now - then) / 1000));
  const steps = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  for (const [label, size] of steps) {
    if (seconds >= size) {
      const count = Math.floor(seconds / size);
      return `${count} ${label}${count > 1 ? 's' : ''} ago`;
    }
  }
  return 'just now';
}

/** GitHub reports repository size in KB. */
export function formatSize(kb) {
  const n = Number(kb);
  if (!Number.isFinite(n) || n <= 0) return '—';
  if (n < 1024) return `${n} KB`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024).toFixed(1)} GB`;
}

export function truncate(text, max = 120) {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

const LANGUAGE_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572a5',
  Java: '#b07219',
  Go: '#00add8',
  Rust: '#dea584',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  PHP: '#4f5d95',
  Ruby: '#701516',
  Swift: '#f05138',
  Kotlin: '#a97bff',
  Dart: '#00b4ab',
  Shell: '#89e051',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Vue: '#41b883',
  Scala: '#c22d40',
  Lua: '#000080',
  'Jupyter Notebook': '#da5b0b',
};

export function getLanguageColor(language) {
  return LANGUAGE_COLORS[language] || '#94a3b8';
}
