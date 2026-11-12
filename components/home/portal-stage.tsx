"use client";

import Link from "next/link";
import { useEffect, useReducer, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { LiveRegion, useAnnouncer } from "@/components/browse/live-region";
import { useOnlineStatus } from "@/components/browse/use-online-status";
import { CharacterCard } from "@/components/card/character-card";
import {
  INITIAL_PORTAL_STATE,
  SPIN_MS,
  pickRandomId,
  portalReducer,
  readLastKnownCount,
  revealAnnouncement,
  type PortalSource,
} from "@/lib/portal/portal";
import { characterOptions, totalCountOptions } from "@/lib/query/portal";

// Fixed copy only: API error text never reaches the screen or the live region (T-02-05).
const ERROR_TEXT = "The portal didn't open.";
const OFFLINE_TEXT = "You appear to be offline.";

const PRESS =
  "transition-transform duration-150 active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100";
const PRIMARY_BUTTON = `inline-flex min-h-12 items-center justify-center rounded-full bg-blue px-6 text-base font-bold text-bg hover:bg-blue-hover aria-disabled:cursor-default aria-disabled:opacity-60 ${PRESS}`;
const SECONDARY_BUTTON = `inline-flex min-h-12 items-center justify-center rounded-full border border-border-ui bg-surface px-6 text-base font-bold text-text hover:bg-surface-raised aria-disabled:cursor-default aria-disabled:opacity-60 ${PRESS}`;

const CONIC =
  "bg-[conic-gradient(from_0deg,var(--color-teal),var(--color-blue),var(--color-purple),var(--color-teal))]";

function abortError(): DOMException {
  return new DOMException("The spin was cancelled", "AbortError");
}

/** Resolves after `ms`; rejects with an AbortError as soon as `signal` aborts. */
function wait(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(abortError());
      return;
    }
    const onAbort = () => {
      clearTimeout(timer);
      reject(abortError());
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

// The portal (HOME-01 to HOME-06). One user activation is one spin: a count (cached,
// then last-known, then requested), one random ID, one character request. Nothing is
// requested on load. Refs are only read or written in handlers and effects.
export function PortalStage() {
  const queryClient = useQueryClient();
  const { regionRef, announce } = useAnnouncer();
  const online = useOnlineStatus();
  const [state, dispatch] = useReducer(portalReducer, INITIAL_PORTAL_STATE);

  const busyRef = useRef(false);
  const tokenRef = useRef(0);
  const previousIdRef = useRef<number | null>(null);
  const spinAbortRef = useRef<AbortController | null>(null);
  const activeKeyRef = useRef<readonly unknown[] | null>(null);
  const revealRef = useRef<HTMLDivElement | null>(null);
  const retryRef = useRef<HTMLButtonElement | null>(null);
  const focusCardRef = useRef(false);

  async function resolveCount(): Promise<number> {
    const options = totalCountOptions();
    const cached = queryClient.getQueryData(options.queryKey);
    if (cached !== undefined && cached > 0) return cached;
    const remembered = readLastKnownCount();
    if (remembered !== null) {
      // Refresh the hint in the background; this spin does not wait for it.
      void queryClient.prefetchQuery(options);
      return remembered;
    }
    return queryClient.fetchQuery(options);
  }

  async function spin(source: PortalSource): Promise<void> {
    if (busyRef.current) return;
    busyRef.current = true;
    const token = tokenRef.current + 1;
    tokenRef.current = token;
    const controller = new AbortController();
    spinAbortRef.current = controller;
    const { signal } = controller;
    dispatch({ type: "start", token, source });

    try {
      const count = await resolveCount();
      if (signal.aborted) {
        dispatch({ type: "cancel", token });
        return;
      }
      const id = pickRandomId(count, previousIdRef.current);
      if (id === null) throw new Error("no characters to draw");

      const options = characterOptions(id);
      activeKeyRef.current = options.queryKey;
      const [character] = await Promise.all([
        queryClient.fetchQuery(options),
        wait(SPIN_MS, signal),
      ]);
      if (signal.aborted) {
        dispatch({ type: "cancel", token });
        return;
      }
      if (character === null || character === undefined) throw new Error("no character");

      // Decide before dispatching: the Retry button unmounts when the card appears.
      if (retryRef.current !== null && document.activeElement === retryRef.current) {
        focusCardRef.current = true;
      }
      previousIdRef.current = character.id;
      dispatch({ type: "success", token, character });
      announce(revealAnnouncement(character.name));
    } catch {
      dispatch({ type: signal.aborted ? "cancel" : "failure", token });
    } finally {
      if (tokenRef.current === token) {
        busyRef.current = false;
        activeKeyRef.current = null;
      }
    }
  }

  // Leaving Home (unmount, or Activity hiding the route) cancels the spin's timer and
  // its character request. The shared count query is never cancelled.
  useEffect(
    () => () => {
      spinAbortRef.current?.abort();
      const key = activeKeyRef.current;
      if (key !== null) void queryClient.cancelQueries({ queryKey: key });
    },
    [queryClient],
  );

  // After a successful Retry the pressed button is gone: hand focus to the new card.
  useEffect(() => {
    if (state.phase !== "revealed" || !focusCardRef.current) return;
    focusCardRef.current = false;
    revealRef.current?.querySelector<HTMLElement>("article")?.focus();
  }, [state.phase, state.token]);

  const spinning = state.phase === "spinning";
  const character = state.phase === "revealed" ? state.character : null;
  const showError = state.phase === "error" || (spinning && state.source === "retry");

  return (
    <div className="flex w-full flex-col items-center">
      <div className="grid place-items-center">
        <button
          type="button"
          aria-disabled={spinning || undefined}
          onClick={() => {
            if (spinning) return;
            void spin("portal");
          }}
          className={`relative grid size-[min(70vw,22rem)] place-items-center rounded-full aria-disabled:cursor-default [grid-area:1/1] ${PRESS}`}
        >
          <span aria-hidden="true" className="absolute inset-0">
            <span className={`absolute inset-0 rounded-full opacity-60 blur-2xl ${CONIC}`} />
            <span className={`absolute inset-[6%] rounded-full ${CONIC}`} />
            <span className="absolute inset-[24%] rounded-full bg-bg" />
          </span>
          <span className="relative z-10 inline-flex min-h-12 items-center rounded-full bg-bg px-6 font-bold text-text">
            Open portal
          </span>
        </button>

        {character !== null ? (
          <div
            ref={revealRef}
            key={character.id}
            className="relative z-10 w-[min(56vw,15rem)] [grid-area:1/1]"
          >
            <CharacterCard character={character} eager />
          </div>
        ) : null}
      </div>

      <p className="mt-4 min-h-5 text-sm text-text-muted">
        {spinning ? "Opening the portal..." : null}
      </p>

      {state.previousId !== null ? (
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <button
            type="button"
            aria-disabled={spinning || undefined}
            onClick={() => {
              if (spinning) return;
              void spin("again");
            }}
            className={PRIMARY_BUTTON}
          >
            Spin again
          </button>
          {character !== null ? (
            <Link
              href={`/character/${character.id}`}
              prefetch={false}
              aria-label={`View details for ${character.name.trim()}`}
              className={SECONDARY_BUTTON}
            >
              View details
            </Link>
          ) : null}
        </div>
      ) : null}

      {showError ? (
        <div
          role="alert"
          className="mt-6 flex flex-wrap items-center justify-center gap-4 text-center"
        >
          <p className="text-base text-text">{online ? ERROR_TEXT : OFFLINE_TEXT}</p>
          <button
            ref={retryRef}
            type="button"
            aria-disabled={spinning || undefined}
            onClick={() => {
              if (spinning) return;
              void spin("retry");
            }}
            className={SECONDARY_BUTTON}
          >
            Retry
          </button>
        </div>
      ) : null}

      <LiveRegion regionRef={regionRef} />
    </div>
  );
}
