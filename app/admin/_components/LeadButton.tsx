"use client";

import type { ReactNode } from "react";
import type { LeadCard } from "@/lib/status";
import { useOpenLead } from "./leadCache";

export default function LeadButton({ lead, className, children }: { lead: LeadCard; className?: string; children: ReactNode }) {
  const open = useOpenLead();
  return (
    <button type="button" className={className} onClick={() => open(lead)}>
      {children}
    </button>
  );
}
