"use client";

import { useSearchParams } from "next/navigation";

export function DeletedNotice() {
  const params = useSearchParams();
  if (params.get("deleted") !== "1") return null;
  return (
    <div role="status" className="border-b border-line bg-gain-soft px-4 py-3 text-center text-sm font-medium text-gain">
      Your account and all of its data were deleted.
    </div>
  );
}
