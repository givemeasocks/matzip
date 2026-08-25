"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Tab {
  id: string;
  label: string;
  href: string;
  icon: (active: boolean) => React.ReactNode;
}

const tabs: Tab[] = [
  {
    id: "home",
    label: "홈",
    href: "/",
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 11.5 12 4l8 7.5" />
        <path d="M6 10v9a1 1 0 0 0 1 1h4v-6h2v6h4a1 1 0 0 0 1-1v-9" />
      </svg>
    ),
  },
  {
    id: "popular",
    label: "인기",
    href: "/#popular",
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3c1 3-3 4-3 8a3 3 0 0 0 6 0c0-1.5-1-2-1-3.5 1.5 1 3 3 3 5.5a5 5 0 0 1-10 0C7 9 9 6 12 3Z" />
      </svg>
    ),
  },
  {
    id: "recommended",
    label: "추천",
    href: "/#recommended",
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l2.2 5.3 5.8.5-4.4 3.8 1.4 5.6-5-3.2-5 3.2 1.4-5.6-4.4-3.8 5.8-.5L12 3Z" />
      </svg>
    ),
  },
  {
    id: "mypage",
    label: "마이",
    href: "/mypage",
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1Z" />
      </svg>
    ),
  },
];

export default function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="주요 기능 이동"
      className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border bg-surface pb-[max(8px,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-2px_8px_rgba(0,0,0,0.04)] sm:hidden"
    >
      {tabs.map((tab) => {
        const isActive = tab.href === "/" ? pathname === "/" : pathname === tab.href;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className="flex min-h-11 w-16 flex-col items-center justify-center gap-1 py-1"
          >
            <span className={isActive ? "h-5 w-5 text-primary" : "h-5 w-5 text-foreground-tertiary"}>
              {tab.icon(isActive)}
            </span>
            <span
              className={
                isActive
                  ? "text-[11px] font-semibold text-primary"
                  : "text-[11px] font-semibold text-foreground-tertiary"
              }
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
