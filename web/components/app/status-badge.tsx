import { Badge } from "@/components/ui/badge";
import type { CostStatus } from "@/types/database";

export function StatusBadge({ status }: { status: CostStatus }) {
  if (status === "active")
    return (
      <Badge tone="gain">
        <span className="size-1.5 rounded-full bg-gain" aria-hidden="true" />
        Active
      </Badge>
    );
  if (status === "paused")
    return (
      <Badge tone="warn">
        <span className="h-2 w-1.5 border-x-2 border-warn" aria-hidden="true" />
        Paused
      </Badge>
    );
  return <Badge tone="muted">Inactive</Badge>;
}
