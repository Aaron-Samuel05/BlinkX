"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { LeadCard } from "@/lib/status";

// Cards already on screen, so the drawer can paint instantly while details load.
export const leadCache = new Map<string, LeadCard>();

export function useOpenLead() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  return useCallback(
    (lead: LeadCard) => {
      leadCache.set(lead.id, lead);
      const next = new URLSearchParams(params.toString());
      next.set("lead", lead.id);
      router.push(`${pathname}?${next}`, { scroll: false });
    },
    [router, pathname, params]
  );
}
