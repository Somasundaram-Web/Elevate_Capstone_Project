import { useEffect, useRef, useState } from 'react';

const MAX_LENGTH = 1000;

/** Modal dialog for writing a personal note on a bookmarked repository. */
export default function NotesModal({ repo, initialNote = '', onSave, onClose }) {
  const [note, setNote] = useState(initialNote);
  const textareaRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Focus once on open; close on Escape.
  useEffect(() => {
    textareaRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onCloseRef.current();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const submit = (e) => {
    e.preventDefault();
    onSave(repo.id, note.trim());
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notes-title"
    >
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
      <form onSubmit={submit} className="card relative w-full max-w-lg p-5 shadow-xl">
        <h2 id="notes-title" className="text-lg font-bold text-slate-900">
          Notes for {repo.fullName}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Saved in your browser only. Jot down why this project matters to you.
        </p>

        <label htmlFor="note-text" className="sr-only">
          Note
        </label>
        <textarea
          id="note-text"
          ref={textareaRef}
          className="input mt-4 h-40 resize-y"
          maxLength={MAX_LENGTH}
          placeholder="e.g. Good candidate for the auth service rewrite…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <p className="mt-1 text-right text-xs text-slate-400">
          {note.length}/{MAX_LENGTH}
        </p>

        <div className="mt-4 flex justify-end gap-2">
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Save note
          </button>
        </div>
      </form>
    </div>
  );
}
