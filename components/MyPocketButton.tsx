"use client";

import Link from "next/link";
import { useUser } from "@/hooks/useUser";

export default function MyPocketButton() {
  const { user, isLoading } = useUser();

  if (isLoading || !user) {
    return null;
  }

  return (
    <Link
      href="/mypage"
      className="text-sm font-semibold text-foreground-secondary transition-colors hover:text-primary"
    >
      맛집 주머니
    </Link>
  );
}
