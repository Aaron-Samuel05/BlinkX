import { Suspense } from "react";
import { LogOut } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { logout } from "../actions";
import Nav from "../_components/Nav";
import LeadDrawer from "../_components/LeadDrawer";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebarBrand">
          <img src="/blinkx-logo-dark.png" alt="Blink X" />
          <span>ADMIN</span>
        </div>
        <Nav variant="side" />
        <div className="sidebarFoot">
          <small>{admin.email}</small>
          <form action={logout}>
            <button className="linkButton"><LogOut size={15} /> Sign out</button>
          </form>
        </div>
      </aside>
      <main className="main">{children}</main>
      <nav className="mobileBar" aria-label="Admin">
        <Nav variant="bottom" />
      </nav>
      <Suspense>
        <LeadDrawer />
      </Suspense>
    </div>
  );
}
