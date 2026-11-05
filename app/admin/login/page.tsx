import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");
  return (
    <main className="loginWrap">
      <div className="card loginCard">
        <img src="/blinkx-logo.png" alt="Blink X" />
        <div>
          <h1>Admin sign in</h1>
          <p className="muted" style={{ margin: "4px 0 0" }}>Bookings, payments and schedule.</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
