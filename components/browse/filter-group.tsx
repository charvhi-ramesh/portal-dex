import { labelFor } from "@/lib/browse/filters";

// Labelled toggle-chip group (D-07). Chips keep stable keys so they never remount on
// toggle and focus stays on the pressed chip. Under 640 px the row is one horizontally
// scrolling line that bleeds to the viewport edges with a 24 px trailing fade; from
// 640 px the chips wrap. The row's vertical padding keeps the 4 px focus ring unclipped
// by the scroll container (offset by the negative bottom margin so spacing is unchanged).
export function FilterGroup({
  id,
  label,
  options,
  value,
  onToggle,
}: {
  id: string;
  label: string;
  options: readonly string[];
  value: string | null;
  onToggle(value: string): void;
}) {
  return (
    <div role="group" aria-labelledby={`${id}-label`}>
      <span
        id={`${id}-label`}
        className="block text-sm font-bold text-text-muted"
      >
        {label}
      </span>
      <div className="-mx-4 mt-1 -mb-1 flex flex-nowrap gap-2 overflow-x-auto px-4 py-1 [mask-image:linear-gradient(to_right,black_calc(100%-24px),transparent)] [scroll-padding-inline:16px] [scrollbar-width:none] sm:mx-0 sm:mt-2 sm:mb-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:py-0 sm:[mask-image:none]">
        {options.map((option) => {
          const active = option === value;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(option)}
              className={`inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-1 rounded-full px-4 text-sm whitespace-nowrap transition-transform duration-150 active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 ${
                active
                  ? "bg-blue text-bg hover:bg-blue-hover"
                  : "border border-border-ui bg-surface text-text hover:bg-surface-raised"
              }`}
            >
              {active && (
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="size-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m5 12 5 5L20 7" />
                </svg>
              )}
              {labelFor(option)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
