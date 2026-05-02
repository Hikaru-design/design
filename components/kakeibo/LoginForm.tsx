"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet } from "lucide-react";

interface LoginFormProps {
  onGuestMode?: () => void;
}

export function LoginForm({ onGuestMode }: LoginFormProps) {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
    } else {
      setMessage("確認メールを送信しました。メールのリンクをクリックしてください。");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(145deg, oklch(0.44 0.18 168) 0%, oklch(0.50 0.16 192) 40%, oklch(0.36 0.16 148) 100%)",
        }}
      />
      {/* Decorative blobs */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-30 blur-3xl"
        style={{ background: "oklch(0.70 0.18 130)" }}
      />
      <div
        className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full opacity-25 blur-3xl"
        style={{ background: "oklch(0.60 0.20 200)" }}
      />
      <div
        className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full opacity-15 blur-3xl"
        style={{ background: "oklch(0.80 0.14 168)" }}
      />

      {/* Card */}
      <div className="relative w-full max-w-sm animate-scale-in">
        <div
          className="rounded-3xl p-8 shadow-2xl"
          style={{
            background: "oklch(1 0 0 / 0.90)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            border: "1px solid oklch(1 0 0 / 0.50)",
            boxShadow: "0 24px 64px oklch(0 0 0 / 0.20), 0 4px 16px oklch(0 0 0 / 0.10)",
          }}
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
              style={{
                background: "linear-gradient(135deg, oklch(0.44 0.18 168), oklch(0.50 0.16 192))",
                boxShadow: "0 8px 24px oklch(0.44 0.18 168 / 0.40)",
              }}
            >
              <Wallet className="h-8 w-8 text-white" />
            </div>
            <h1 className="type-title1" style={{ color: "oklch(0.14 0.02 168)" }}>家計簿</h1>
            <p className="type-caption1 mt-1" style={{ color: "oklch(0.50 0.06 168)" }}>
              スマートな家計管理
            </p>
          </div>

          {/* Tab switcher */}
          <div
            className="flex rounded-2xl p-1 mb-6"
            style={{ background: "oklch(0.92 0.007 168)" }}
          >
            {(["login", "signup"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); setMessage(""); }}
                className="flex-1 py-2 rounded-xl type-subheadline font-semibold transition-all duration-300"
                style={
                  tab === t
                    ? {
                        background: "oklch(1 0 0)",
                        color: "oklch(0.44 0.18 168)",
                        boxShadow: "0 2px 8px oklch(0 0 0 / 0.10)",
                      }
                    : { color: "oklch(0.50 0.06 168)" }
                }
              >
                {t === "login" ? "ログイン" : "新規登録"}
              </button>
            ))}
          </div>

          {/* Form */}
          <form
            onSubmit={tab === "login" ? handleLogin : handleSignUp}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="type-footnote font-semibold"
                style={{ color: "oklch(0.36 0.08 168)" }}
              >
                メールアドレス
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 rounded-xl border-0"
                style={{
                  background: "oklch(0.96 0.005 168)",
                  color: "oklch(0.14 0.02 168)",
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="type-footnote font-semibold"
                style={{ color: "oklch(0.36 0.08 168)" }}
              >
                {tab === "signup" ? "パスワード（6文字以上）" : "パスワード"}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={tab === "signup" ? 6 : undefined}
                className="h-11 rounded-xl border-0"
                style={{
                  background: "oklch(0.96 0.005 168)",
                  color: "oklch(0.14 0.02 168)",
                }}
              />
            </div>

            {error && (
              <p className="type-caption1 text-destructive bg-destructive/8 rounded-xl px-3 py-2">
                {error}
              </p>
            )}
            {message && (
              <p className="type-caption1 rounded-xl px-3 py-2" style={{ color: "oklch(0.44 0.18 168)", background: "oklch(0.90 0.08 168)" }}>
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-2xl type-headline text-white font-semibold transition-all duration-200 active:scale-95 disabled:opacity-60 mt-2"
              style={{
                background: "linear-gradient(135deg, oklch(0.44 0.18 168), oklch(0.50 0.16 192))",
                boxShadow: loading ? "none" : "0 6px 20px oklch(0.44 0.18 168 / 0.40)",
              }}
            >
              {loading
                ? (tab === "login" ? "ログイン中..." : "登録中...")
                : (tab === "login" ? "ログイン" : "アカウント作成")}
            </button>
          </form>

          {onGuestMode && (
            <>
              <div className="flex items-center gap-3 mt-5">
                <div className="flex-1 h-px" style={{ background: "oklch(0.85 0.01 168)" }} />
                <span className="type-caption1" style={{ color: "oklch(0.60 0.04 168)" }}>または</span>
                <div className="flex-1 h-px" style={{ background: "oklch(0.85 0.01 168)" }} />
              </div>
              <button
                type="button"
                onClick={onGuestMode}
                className="w-full h-11 rounded-2xl type-callout font-medium mt-3 transition-all duration-200 active:scale-95"
                style={{
                  background: "oklch(0.94 0.01 168)",
                  color: "oklch(0.44 0.10 168)",
                }}
              >
                登録なしでゲストとして試す
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
