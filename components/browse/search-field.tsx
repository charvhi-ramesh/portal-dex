"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const SEARCH_DEBOUNCE_MS = 300 as const;

// Debounced name search. The URL is written only on the debounced commit (or on
// Enter, Escape and the clear button), never per keystroke, so history stays clean.
export function SearchField({
  value,
  onCommit,
}: {
  value: string;
  onCommit(q: string): void;
}) {
  const [draft, setDraft] = useState(value);
  // Adopt an external `value` (Back, Forward, Clear all) into the draft during render.
  // `committed` is the last trimmed text this field wrote, so the URL echoing our own
  // commit back never clobbers text typed after it (no setState in an effect).
  const [prevValue, setPrevValue] = useState(value);
  const [committed, setCommitted] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    if (value !== committed) {
      setDraft(value);
      setCommitted(value);
    }
  }

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);
  // Refs mirror the latest props and state for the timer and effects (refs cannot be
  // read during render).
  const committedRef = useRef(value);
  const onCommitRef = useRef(onCommit);

  useEffect(() => {
    onCommitRef.current = onCommit;
  });

  const cancelTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // An external value change supersedes any pending commit of older text.
  useEffect(() => {
    if (value !== committedRef.current) {
      cancelTimer();
      committedRef.current = value;
    }
  }, [value, cancelTimer]);

  useEffect(() => cancelTimer, [cancelTimer]);

  function commit(text: string) {
    cancelTimer();
    const clean = text.trim();
    if (clean === committedRef.current) return;
    committedRef.current = clean;
    setCommitted(clean);
    onCommitRef.current(clean);
  }

  function handleChange(next: string) {
    setDraft(next);
    cancelTimer();
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      commit(next);
    }, SEARCH_DEBOUNCE_MS);
  }

  function clear() {
    setDraft("");
    commit("");
  }

  return (
    <div className="relative w-full sm:max-w-[480px]">
      <label htmlFor="browse-search" className="sr-only">
        Search characters by name
      </label>
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="pointer-events-none absolute top-3 left-3 size-6 text-text-muted"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        ref={inputRef}
        id="browse-search"
        type="search"
        value={draft}
        placeholder="Search by name"
        maxLength={60} // equals MAX_QUERY_LENGTH in lib/browse/filters.ts
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="search"
        onChange={(event) => handleChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            commit(draft);
          } else if (event.key === "Escape") {
            event.preventDefault();
            clear();
          }
        }}
        className="h-12 w-full rounded-input border border-border-ui bg-surface px-12 text-base text-text placeholder:text-text-muted hover:bg-surface-raised [&::-webkit-search-cancel-button]:appearance-none"
      />
      {draft !== "" && (
        <button
          type="button"
          onClick={() => {
            clear();
            inputRef.current?.focus();
          }}
          className="absolute top-0.5 right-0.5 inline-flex size-11 items-center justify-center rounded-full text-text hover:bg-surface-raised active:scale-[0.97] motion-reduce:active:scale-100"
        >
          <span className="sr-only">Clear search</span>
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="size-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
