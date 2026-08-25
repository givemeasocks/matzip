"use client";

import { useState } from "react";
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/lib/supabase/client";
import AuthModal from "./AuthModal";

export default function AuthButton() {
  const { user, isLoading } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isLoading) {
    return <div className="h-9 w-20" />;
  }

  if (user) {
    const displayName = user.email?.split("@")[0] ?? "회원";
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className="text-foreground-secondary">{displayName}님</span>
        <button
          type="button"
          onClick={() => supabase.auth.signOut()}
          className="font-semibold text-primary hover:underline"
        >
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
      >
        로그인
      </button>
      {isModalOpen && <AuthModal onClose={() => setIsModalOpen(false)} />}
    </>
  );
}
