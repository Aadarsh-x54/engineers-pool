"use client";

import { FormEvent, useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SearchBarProps = {
  onSearch: (query: string) => void;
  loading?: boolean;
};

export function SearchBar({ onSearch, loading }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isFirstRender, setIsFirstRender] = useState(true);

  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      onSearch(query.trim());
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query, onSearch, isFirstRender]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch(query.trim());
  }

  return (
    <form onSubmit={submit} className="flex w-full flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search notes, subjects, branches, programming topics"
          className="h-12 pl-10 pr-10 bg-zinc-950/60 border-white/10 text-white"
          aria-label="Search notes"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              onSearch("");
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-white"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      <Button type="submit" className="h-12 sm:w-32 bg-white hover:bg-zinc-200 text-black" disabled={loading}>
        <Search className="h-4 w-4" />
        {loading ? "Searching" : "Search"}
      </Button>
    </form>
  );
}
