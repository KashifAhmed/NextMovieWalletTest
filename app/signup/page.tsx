"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { useAuth } from "@/features/auth/client/auth-provider";

export default function SignUpPage() {
  const router = useRouter();
  const { isAuthenticated, refreshSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) return null;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = (await response.json().catch(() => null)) as
      | { user: { id: string; email: string } }
      | { message?: string }
      | null;

    if (!response.ok || !data || !("user" in data)) {
      const message =
        data && typeof data === "object" && "message" in data && typeof data.message === "string"
          ? data.message
          : "Failed to sign up.";
      setError(message);
      setLoading(false);
      return;
    }

    await refreshSession();
    router.push("/");
    router.refresh();
  }

  return (
    <PageLayout>
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-[340px]">
          <h1 className="mb-8 text-center text-5xl font-semibold text-white">Sign Up</h1>
          <form onSubmit={onSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
              className="h-[45px] w-full rounded-[10px] border border-input/50 bg-input px-4 text-white placeholder:text-gray-300 focus:border-primary focus:outline-none"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              className="h-[45px] w-full rounded-[10px] border border-input/50 bg-input px-4 text-white placeholder:text-gray-300 focus:border-primary focus:outline-none"
              required
              minLength={6}
            />
            {error ? <p className="text-xs text-error">{error}</p> : null}
            <button
              type="submit"
              disabled={loading}
              className="h-[54px] w-full rounded-[10px] bg-primary text-base font-semibold text-white transition hover:bg-green-400 disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-300">
            Already have an account?{" "}
            <Link href="/signin" className="font-semibold text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
