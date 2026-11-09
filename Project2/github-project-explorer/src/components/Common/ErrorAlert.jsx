/** Error banner with an optional retry button. */
export default function ErrorAlert({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <p className="font-semibold">{title}</p>
        {message && <p className="mt-1 text-sm text-red-700">{message}</p>}
      </div>
      {onRetry && (
        <button type="button" className="btn btn-danger shrink-0" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

/** Friendly "nothing here" placeholder. */
export function EmptyState({ title, message, children }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <p className="text-lg font-semibold text-slate-700">{title}</p>
      {message && <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{message}</p>}
      {children && <div className="mt-5 flex flex-wrap justify-center gap-2">{children}</div>}
    </div>
  );
}
