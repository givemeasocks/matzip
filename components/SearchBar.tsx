"use client";

import { FormEvent, useState } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export default function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSearch(trimmed);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full items-center gap-2 rounded-2xl border border-border bg-surface p-2 shadow-sm"
    >
      <input
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="서울 맛집을 검색해보세요 (예: 이태원 파스타)"
        className="min-w-0 flex-1 rounded-xl px-4 py-3 text-base text-foreground outline-none placeholder:text-foreground-tertiary"
      />
      <button
        type="submit"
        disabled={isLoading}
        className="shrink-0 rounded-xl bg-primary px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "검색 중.." : "검색"}
      </button>
    </form>
  );
}
