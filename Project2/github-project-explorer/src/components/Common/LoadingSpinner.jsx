export default function LoadingSpinner({ label = 'Loading…', className = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-16 text-slate-500 ${className}`}
      role="status"
      aria-live="polite"
    >
      <span className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
