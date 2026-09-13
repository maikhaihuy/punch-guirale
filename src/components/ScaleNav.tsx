"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { SCALE_FAMILIES, type ScaleFamily } from "@/lib/scales";

type FlatItem = { type: "family" | "mode"; familyId: string; modeId?: string };

type NavTreeProps = {
  activeFamilyId: string;
  activeModeId: string;
  activeVariantId: string | undefined;
  expandedFamilyId: string;
  onExpandFamily: (familyId: string) => void;
  onSelectFamily: (familyId: string) => void;
  onSelectMode: (modeId: string) => void;
  onSelectVariant: (variantId: string | undefined) => void;
};

function flattenItems(expandedFamilyId: string): FlatItem[] {
  const items: FlatItem[] = [];
  for (const family of SCALE_FAMILIES) {
    items.push({ type: "family", familyId: family.id });
    if (family.id === expandedFamilyId) {
      for (const mode of family.modes) {
        items.push({ type: "mode", familyId: family.id, modeId: mode.id });
      }
    }
  }
  return items;
}

function NavTree({
  activeFamilyId,
  activeModeId,
  activeVariantId,
  expandedFamilyId,
  onExpandFamily,
  onSelectFamily,
  onSelectMode,
  onSelectVariant,
}: NavTreeProps) {
  const flatItems = flattenItems(expandedFamilyId);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const focusIndex = (index: number) => {
    const clamped = Math.max(0, Math.min(flatItems.length - 1, index));
    setFocusedIndex(clamped);
    itemRefs.current[clamped]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      focusIndex(index + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      focusIndex(index - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const item = flatItems[index];
      if (item.type === "family") onSelectFamily(item.familyId);
      else if (item.modeId) onSelectMode(item.modeId);
    }
  };

  return (
    <div role="tree" aria-label="Scale family and mode">
      {SCALE_FAMILIES.map((family) => {
        const familyIndex = flatItems.findIndex(
          (item) => item.type === "family" && item.familyId === family.id,
        );
        const isActiveFamily = family.id === activeFamilyId;
        const isExpanded = family.id === expandedFamilyId;

        return (
          <div key={family.id} role="group">
            <div
              ref={(el) => {
                itemRefs.current[familyIndex] = el;
              }}
              role="treeitem"
              tabIndex={familyIndex === focusedIndex ? 0 : -1}
              aria-expanded={isExpanded}
              aria-selected={isActiveFamily}
              onFocus={() => setFocusedIndex(familyIndex)}
              onClick={() => {
                onExpandFamily(family.id);
                onSelectFamily(family.id);
              }}
              onKeyDown={(e) => handleKeyDown(e, familyIndex)}
              className={`cursor-pointer rounded-md px-2 py-1.5 text-sm font-medium outline-none ${
                isActiveFamily
                  ? "bg-text text-bg"
                  : "text-text hover:bg-black/5 dark:hover:bg-white/10"
              }`}
            >
              {family.displayName}
            </div>
            {isExpanded && (
              <div
                role="group"
                className="ml-3 flex flex-col gap-0.5 border-l border-black/10 py-1 pl-2 dark:border-white/10"
              >
                {family.modes.map((mode) => {
                  const modeIndex = flatItems.findIndex(
                    (item) =>
                      item.type === "mode" && item.familyId === family.id && item.modeId === mode.id,
                  );
                  const isActiveMode = isActiveFamily && mode.id === activeModeId;
                  return (
                    <div
                      key={mode.id}
                      ref={(el) => {
                        itemRefs.current[modeIndex] = el;
                      }}
                      role="treeitem"
                      tabIndex={modeIndex === focusedIndex ? 0 : -1}
                      aria-selected={isActiveMode}
                      onFocus={() => setFocusedIndex(modeIndex)}
                      onClick={() => onSelectMode(mode.id)}
                      onKeyDown={(e) => handleKeyDown(e, modeIndex)}
                      className={`cursor-pointer rounded-md px-2 py-1 text-sm outline-none ${
                        isActiveMode
                          ? "bg-text text-bg"
                          : "text-text/80 hover:bg-black/5 dark:hover:bg-white/10"
                      }`}
                    >
                      {mode.displayName}
                    </div>
                  );
                })}
                {isActiveFamily &&
                  family.variants?.map((variant) => (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => onSelectVariant(activeVariantId === variant.id ? undefined : variant.id)}
                      aria-pressed={activeVariantId === variant.id}
                      className={`mt-1 rounded-full px-2.5 py-1 text-left text-xs font-medium ${
                        activeVariantId === variant.id
                          ? "bg-accent text-white"
                          : "bg-black/5 text-text-muted hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20"
                      }`}
                    >
                      {variant.displayName}
                    </button>
                  ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

type Props = {
  family: ScaleFamily;
  modeId: string;
  variantId: string | undefined;
  onFamilyChange: (familyId: string) => void;
  onModeChange: (modeId: string) => void;
  onVariantChange: (variantId: string | undefined) => void;
};

export function ScaleNav({
  family,
  modeId,
  variantId,
  onFamilyChange,
  onModeChange,
  onVariantChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const [expandedFamilyId, setExpandedFamilyId] = useState(family.id);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep the tree's expansion in sync when navigation changes the active
  // family from elsewhere (e.g. browser back/forward).
  useEffect(() => setExpandedFamilyId(family.id), [family.id]);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const currentModeName = family.modes.find((m) => m.id === modeId)?.displayName ?? modeId;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full bg-black/5 px-3 py-1.5 text-sm font-medium text-text hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20"
      >
        <span>
          {family.displayName} / {currentModeName}
        </span>
        <ChevronDown className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>

      {open && (
        <div className="absolute top-full left-0 z-50 mt-2 max-h-[70vh] w-64 overflow-y-auto rounded-lg border border-black/10 bg-bg p-2 shadow-xl dark:border-white/10">
          <NavTree
            activeFamilyId={family.id}
            activeModeId={modeId}
            activeVariantId={variantId}
            expandedFamilyId={expandedFamilyId}
            onExpandFamily={setExpandedFamilyId}
            onSelectFamily={(familyId) => {
              onFamilyChange(familyId);
              setOpen(false);
            }}
            onSelectMode={(nextModeId) => {
              onModeChange(nextModeId);
              setOpen(false);
            }}
            onSelectVariant={onVariantChange}
          />
        </div>
      )}
    </div>
  );
}
