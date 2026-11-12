import type { Ref } from "react";
import { countText } from "@/lib/browse/announce";

// Count line and Clear all. The row keeps a fixed 44 px height so Clear all appearing or
// disappearing never moves content, and `scroll-mt-20` (80 px) lets it be scrolled to
// clear the sticky header (BRW-10). The count is visual only: announcements go through
// the separate polite region (plan 01-08), so nothing here is a live region.
export function ResultsToolbar({
  count,
  showClearAll,
  onClearAll,
  unavailable = false,
  ref,
}: {
  count: number | null;
  showClearAll: boolean;
  onClearAll(): void;
  /**
   * The count can never arrive (the first page failed, or the Human total's Humanoid
   * count request failed): show an empty count slot instead of a "Counting..." that
   * never ends, and never a Humanoid-inflated number.
   */
  unavailable?: boolean;
  ref?: Ref<HTMLDivElement>;
}) {
  return (
    <div
      ref={ref}
      className="flex min-h-11 scroll-mt-20 items-center justify-between gap-2"
    >
      <p className="whitespace-nowrap">
        {unavailable ? (
          <span className="inline-block min-w-[16ch]" />
        ) : count === null ? (
          <span className="inline-block min-w-[16ch] text-sm text-text-muted">
            Counting...
          </span>
        ) : (
          countText(count)
        )}
      </p>
      {showClearAll && (
        <button
          type="button"
          onClick={onClearAll}
          className="min-h-11 shrink-0 px-2 text-base font-bold whitespace-nowrap text-blue hover:underline active:scale-[0.97] motion-reduce:active:scale-100"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
