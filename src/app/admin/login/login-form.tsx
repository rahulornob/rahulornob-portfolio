"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "../admin.module.css";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });
    const result = (await response.json()) as { error?: string };
    setLoading(false);
    if (!response.ok) return setError(result.error || "Unable to sign in.");
    router.replace("/admin");
    router.refresh();
  }

  return (
    <main className={styles.loginPage}>
      <form className={styles.loginCard} onSubmit={login}>
        <div className={styles.brandMark}>R</div>
        <div>
          <p className={styles.eyebrow}>Rahul Ornob</p>
          <h1>Content studio</h1>
          <p className={styles.muted}>Sign in to update your live portfolio.</p>
        </div>
        <label>
          <span>Email</span>
          <input name="email" type="email" autoComplete="username" required />
        </label>
        <label>
          <span>Password</span>
          <input name="password" type="password" autoComplete="current-password" required />
        </label>
        {error ? <p className={styles.formError}>{error}</p> : null}
        <button className={styles.primaryButton} type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
        <Link className={styles.backLink} href="/">← Back to website</Link>
      </form>
    </main>
  );
}
