"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface AuthModalProps {
  onClose: () => void;
}

function toKoreanError(message: string): string {
  if (message.includes("Invalid login credentials")) {
    return "이메일 또는 비밀번호가 올바르지 않습니다.";
  }
  if (message.includes("already registered") || message.includes("already exists")) {
    return "이미 가입된 이메일입니다.";
  }
  if (message.includes("Password should be at least")) {
    return "비밀번호는 6자 이상이어야 합니다.";
  }
  if (message.includes("Unable to validate email")) {
    return "올바른 이메일 형식이 아닙니다.";
  }
  if (message.includes("Email not confirmed")) {
    return "이메일 인증이 필요합니다.";
  }
  return "문제가 발생했습니다. 잠시 후 다시 시도해주세요.";
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setIsSubmitting(false);
    if (error) {
      setError(toKoreanError(error.message));
      return;
    }
    onClose();
  };

  const handleSignUp = async () => {
    setError(null);
    setIsSubmitting(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    setIsSubmitting(false);
    if (error) {
      setError(toKoreanError(error.message));
      return;
    }
    if (!data.session) {
      setError("이메일 인증이 필요합니다. 관리자에게 문의해주세요.");
      return;
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">로그인</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="text-foreground-tertiary hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleLogin} className="mt-5 flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="이메일"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="rounded-xl border border-border px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
          />
          <input
            type="password"
            required
            placeholder="비밀번호"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="rounded-xl border border-border px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
          />

          {error && <p className="text-sm text-rose-500">{error}</p>}

          <div className="mt-2 flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              로그인
            </button>
            <button
              type="button"
              onClick={handleSignUp}
              disabled={isSubmitting}
              className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              회원가입
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
