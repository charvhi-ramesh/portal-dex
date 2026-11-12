// Loading placeholder with the real card's outer box, so a skeleton to card swap never
// shifts layout and scroll restoration stays exact (UI-SPEC "Skeleton card"). The
// height-bearing parts mirror CharacterCard:
//   - frame: 2 px border, radius 20 px, `surface` fill, overflow hidden
//   - avatar: 1:1 block
//   - body padding 8 px under 640 px and 16 px from 640 px, 8 px gaps
//   - name: min-height 2.4em at text-base (2 lines at line-height 1.2)
//   - badge: text-sm at line-height 1.2 plus py-1 = 14 * 1.2 + 8 = 24.8 px
//   - species: text-sm line-height = 20 px
// If CharacterCard's typography or spacing changes, change these with it.
export function CardSkeleton() {
  return (
    <div className="skeleton-pulse h-full overflow-hidden rounded-[20px] border-2 border-border-ui bg-surface">
      <div className="aspect-square bg-surface-raised" />
      <div className="flex flex-col gap-2 p-2 sm:p-4">
        <div className="flex min-h-[2.4em] flex-col justify-around text-base">
          <div className="h-3 w-full rounded-full bg-surface-raised" />
          <div className="h-3 w-2/3 rounded-full bg-surface-raised" />
        </div>
        <div className="h-[24.8px] w-20 rounded-full bg-surface-raised" />
        <div className="h-5 w-28 rounded-full bg-surface-raised" />
      </div>
    </div>
  );
}

// `grid` holds 10 items (CSS shows 4 / 6 / 8 / 10 by breakpoint) and `row` holds 5
// (shows 2 / 3 / 4 / 5); see app/globals.css. Hidden from assistive technology: the
// busy region around it and the live region carry the loading state.
export function SkeletonGrid({ variant }: { variant: "grid" | "row" }) {
  const count = variant === "grid" ? 10 : 5;
  return (
    <ul
      aria-hidden="true"
      className={`grid list-none grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4 xl:grid-cols-5 ${
        variant === "grid" ? "skeleton-grid" : "skeleton-row"
      }`}
    >
      {Array.from({ length: count }, (_, index) => (
        <li key={index}>
          <CardSkeleton />
        </li>
      ))}
    </ul>
  );
}
