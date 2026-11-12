import type { Metadata } from "next";
import { NotFoundContent } from "@/components/layout/not-found-content";
import { NOT_FOUND_TITLE } from "@/lib/detail/detail";

// DET-06: root 404 for notFound() and unmatched URLs. A server component with no client
// imports, because it ships with every route. `absolute` is used because the root title
// template is not guaranteed to apply to the root segment's own not-found file.
export const metadata: Metadata = { title: { absolute: NOT_FOUND_TITLE } };

export default function NotFound() {
  return <NotFoundContent />;
}
