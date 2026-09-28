import "server-only";

import { cookies } from "next/headers";
import { TIMEZONE_COOKIE } from "@/lib/constants";
import { todayIn } from "@/lib/dates";

/** Today's date in the viewer's timezone (reported by the browser), else UTC. */
export async function getToday(): Promise<string> {
  const tz = (await cookies()).get(TIMEZONE_COOKIE)?.value;
  return todayIn(tz ? decodeURIComponent(tz) : undefined);
}
