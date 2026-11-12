const OFFLINE_HEADING = "You appear to be offline";
const OFFLINE_BODY = "Reconnect to the internet, then try again.";
const ERROR_HEADING = "Couldn't load characters";
const ERROR_BODY =
  "We couldn't reach the Rick and Morty API. Check your connection and try again.";

// First-page failure panel (BRW-09). Only fixed copy is shown: ApiError messages,
// statuses and any HTML body from the API never reach the screen (T-01-21). The Retry
// button uses aria-disabled rather than disabled so focus stays on it, and presses are
// ignored while a retry is in flight (T-01-22).
export function ErrorPanel({
  offline,
  retrying,
  onRetry,
}: {
  offline: boolean;
  retrying: boolean;
  onRetry(): void;
}) {
  return (
    <div
      role="alert"
      className="mx-auto flex w-full max-w-[480px] flex-col items-center gap-4 rounded-panel border border-border-ui bg-surface px-6 py-12 text-center"
    >
      <svg
        viewBox="0 0 64 64"
        aria-hidden="true"
        className="size-16 text-text-muted"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="32" cy="32" r="26" />
        <path d="M32 18v17" />
        <path d="M32 44v1" />
      </svg>
      <h2 className="text-2xl leading-[1.2] font-bold text-text">
        {offline ? OFFLINE_HEADING : ERROR_HEADING}
      </h2>
      <p className="text-base text-text">{offline ? OFFLINE_BODY : ERROR_BODY}</p>
      <button
        type="button"
        aria-disabled={retrying}
        onClick={() => {
          if (retrying) return;
          onRetry();
        }}
        className="inline-flex min-h-12 items-center justify-center rounded-full bg-blue px-6 text-base font-bold text-bg transition-transform duration-150 hover:bg-blue-hover active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 aria-disabled:cursor-default aria-disabled:opacity-60"
      >
        Retry
      </button>
    </div>
  );
}
