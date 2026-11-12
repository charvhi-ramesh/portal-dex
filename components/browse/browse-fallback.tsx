import { ResultsToolbar } from "@/components/browse/results-toolbar";
import { SkeletonGrid } from "@/components/card/card-skeleton";

function noop() {}

// Static Suspense fallback for /browse: no hooks, so it is part of the prerendered shell
// and the page never shows a blank area before BrowseView hydrates. It mirrors the
// layout BrowseView renders (same wrappers and margins) so nothing jumps on hydration.
//
// The filter bar block reserves 320 px at every breakpoint, worked out from the bar's
// CSS rather than measured in a browser: search field 48 + gap 24 + three groups of
// 72 (20 label line, 8 gap or 4 gap plus 4 padding, 44 chip row) + two 16 gaps = 320.
// It is a minimum, so a Species row that wraps onto a second line from 640 px (about
// 52 px taller, when the container is narrow) still fits without clipping.
export function BrowseFallback() {
  return (
    <>
      <div aria-hidden="true" className="mt-12 min-h-80" />
      <div className="mt-8">
        <ResultsToolbar count={null} showClearAll={false} onClearAll={noop} />
      </div>
      <div aria-busy="true" className="mt-4">
        <SkeletonGrid variant="grid" />
      </div>
    </>
  );
}
