"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { TIMEZONE_COOKIE } from "@/lib/constants";

/**
 * Tells the server the viewer's timezone so "today", "this month" and
 * "renews in 4 days" match the user's calendar, not the server's.
 */
export function TimezoneSync() {
  const router = useRouter();
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!tz) return;
    const current = document.cookie
      .split("; ")
      .find((c) => c.startsWith(`${TIMEZONE_COOKIE}=`))
      ?.split("=")[1];
    if (current && decodeURIComponent(current) === tz) return;
    document.cookie = `${TIMEZONE_COOKIE}=${encodeURIComponent(tz)}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }, [router]);
  return null;
}
