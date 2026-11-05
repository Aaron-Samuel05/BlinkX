"use client";

import { useActionState } from "react";
import { login } from "../actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} style={{ display: "grid", gap: 14 }}>
      <label className="field">
        <span>Email</span>
        <input className="input" name="email" type="email" autoComplete="username" required autoFocus defaultValue={state?.email} key={state?.email} />
      </label>
      <label className="field">
        <span>Password</span>
        <input className="input" name="password" type="password" autoComplete="current-password" required />
      </label>
      {state?.error && <p className="error" role="alert">{state.error}</p>}
      <button className="btn primary" disabled={pending} style={{ height: 42 }}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
