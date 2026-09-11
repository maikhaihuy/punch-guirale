"use client";

import { Drawer } from "@base-ui/react/drawer";
import { Settings2 } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
};

export function SettingsPanel({ open, onOpenChange, children }: Props) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} swipeDirection="left" modal="trap-focus">
      <Drawer.Trigger
        aria-label={open ? "Close settings" : "Open settings"}
        className="fixed top-1/2 left-0 z-[60] -translate-y-1/2 rounded-r-full bg-surface p-2.5 text-text-muted shadow-md transition-colors hover:text-text"
      >
        <Settings2 className="size-5" aria-hidden />
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Backdrop className="fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 data-starting-style:opacity-0 data-ending-style:opacity-0" />
        <Drawer.Viewport className="fixed inset-0 z-50 flex items-stretch justify-start">
          <Drawer.Popup className="flex h-full w-[min(20rem,85vw)] flex-col gap-4 overflow-y-auto border-r border-black/10 bg-bg p-5 pl-8 text-text shadow-xl outline-none transition-transform duration-300 [transform:translateX(var(--drawer-swipe-movement-x))] data-ending-style:-translate-x-full data-starting-style:-translate-x-full dark:border-white/10">
            <Drawer.Title className="text-sm font-semibold text-text-muted">Settings</Drawer.Title>
            {children}
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
