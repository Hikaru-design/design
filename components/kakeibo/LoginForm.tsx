"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Wallet, ArrowRight, Sparkles } from "lucide-react";

export function LoginForm() {
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
    <div className="min-h-screen gradient-bg flex flex-col items-center justify-center p-4">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm space-y-8 animate-fade-in-up">
        {/* Logo & Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 animate-scale-bounce">
            <Wallet className="w-8 h-8" />
          </div>
          <div>
            <h1 className="type-title1 text-foreground">家計簿</h1>
            <p className="type-callout text-muted-foreground mt-1">
              シンプルで賢いお金の管理
            </p>
          </div>
        </div>

        {/* Features badges */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground type-caption1 font-medium">
            <Sparkles className="w-3 h-3" />
            簡単入力
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground type-caption1 font-medium">
            予算管理
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground type-caption1 font-medium">
            グラフ分析
          </span>
        </div>

        {/* Login Card */}
        <div className="glass-card rounded-3xl p-6 shadow-xl">
          <Tabs defaultValue="login">
            <TabsList className="w-full mb-6 p-1 bg-muted rounded-xl">
              <TabsTrigger 
                value="login" 
                className="flex-1 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all"
              >
                ログイン
              </TabsTrigger>
              <TabsTrigger 
                value="signup" 
                className="flex-1 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all"
              >
                新規登録
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-login" className="type-subheadline font-medium">
                    メールアドレス
                  </Label>
                  <Input
                    id="email-login"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 rounded-xl bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-login" className="type-subheadline font-medium">
                    パスワード
                  </Label>
                  <Input
                    id="password-login"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 rounded-xl bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20 transition-all"
                  />
                </div>
                {error && (
                  <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                    <p className="type-footnote text-destructive">{error}</p>
                  </div>
                )}
                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all group" 
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      ログイン中...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      ログイン
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-signup" className="type-subheadline font-medium">
                    メールアドレス
                  </Label>
                  <Input
                    id="email-signup"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 rounded-xl bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signup" className="type-subheadline font-medium">
                    パスワード（6文字以上）
                  </Label>
                  <Input
                    id="password-signup"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-12 rounded-xl bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20 transition-all"
                  />
                </div>
                {error && (
                  <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                    <p className="type-footnote text-destructive">{error}</p>
                  </div>
                )}
                {message && (
                  <div className="p-3 rounded-xl bg-income/10 border border-income/20">
                    <p className="type-footnote text-income">{message}</p>
                  </div>
                )}
                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all group" 
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      登録中...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      アカウント作成
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <p className="text-center type-caption1 text-muted-foreground">
          安全なSupabase認証を使用しています
        </p>
      </div>
    </div>
  );
}
