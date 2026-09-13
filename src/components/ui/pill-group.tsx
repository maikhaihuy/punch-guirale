"use client";

import { cn } from "cn";
import type { ReactNode } from "react";

export type PillGroupOption<T> = {
  key: string;
  label: ReactNode;
  value: T;
};

type Props<T> = {
  options: PillGroupOption<T>[];
  isSelected: (value: T) => boolean;
  onSelect: (value: T) => void;
  variant?: "pill" | "tab";
  className?: string;
};

const VARIANT_CLASS = {
  pill: {
    base: "shrink-0 rounded-full px-2.5 py-1 text-sm font-medium transition-colors",
    active: "bg-text text-bg",
    inactive:
      "bg-black/5 text-text hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20",
  },
  tab: {
    base: "shrink-0 rounded-md px-2.5 py-1 text-sm font-medium transition-colors",
    active: "bg-text text-bg",
    inactive: "text-text/70 hover:bg-black/5 dark:hover:bg-white/10",
  },
} as const;

export function PillGroup<T>({
  options,
  isSelected,
  onSelect,
  variant = "tab",
  className,
}: Props<T>) {
  const styles = VARIANT_CLASS[variant];

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          onClick={() => onSelect(option.value)}
          className={cn(styles.base, isSelected(option.value) ? styles.active : styles.inactive)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
