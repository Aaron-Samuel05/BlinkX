"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, KanbanSquare, LayoutDashboard, UserRound } from "lucide-react";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/board", label: "Board", icon: KanbanSquare },
  { href: "/admin/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/admin/profile", label: "Profile", icon: UserRound },
];

export default function Nav({ variant }: { variant: "side" | "bottom" }) {
  const pathname = usePathname();
  return (
    <>
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link key={href} href={href} prefetch className={`${variant === "side" ? "navLink " : ""}${active ? "active" : ""}`} aria-current={active ? "page" : undefined}>
            <Icon size={variant === "side" ? 18 : 20} />
            {label}
          </Link>
        );
      })}
    </>
  );
}
