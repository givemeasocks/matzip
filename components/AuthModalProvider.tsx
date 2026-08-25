"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import AuthModal from "./AuthModal";

interface AuthModalContextValue {
  openAuthModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AuthModalContext.Provider value={{ openAuthModal: () => setIsOpen(true) }}>
      {children}
      {isOpen && <AuthModal onClose={() => setIsOpen(false)} />}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error("useAuthModal은 AuthModalProvider 내부에서만 사용할 수 있습니다.");
  }
  return context;
}
