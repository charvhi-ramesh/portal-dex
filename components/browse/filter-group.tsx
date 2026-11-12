import { labelFor } from "@/lib/browse/filters";

// Labelled toggle-chip group. Chips keep stable keys so they never remount on toggle
// and focus stays on the pressed chip. Plan 01-07 adds the scroll row and check icon.
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
    <div role="group" aria-labelledby={`${id}-label`} className="mt-6">
      <span
        id={`${id}-label`}
        className="block text-sm font-bold text-text-muted"
      >
        {label}
      </span>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => {
          const active = option === value;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(option)}
              className={`min-h-11 min-w-11 rounded-full px-4 text-sm transition-transform duration-150 active:scale-[0.97] motion-reduce:transition-none ${
                active
                  ? "bg-blue text-bg hover:bg-blue-hover"
                  : "border border-border-ui bg-surface text-text hover:bg-surface-raised"
              }`}
            >
              {labelFor(option)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
