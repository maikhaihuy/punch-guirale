import { notFound } from "next/navigation";

import { ScalePage } from "@/components/ScalePage";
import { getFamily, getMode, SCALE_FAMILIES } from "@/lib/scales";

export async function generateStaticParams() {
  return SCALE_FAMILIES.flatMap((family) =>
    family.modes.map((mode) => ({ family: family.id, mode: mode.id })),
  );
}

export default async function ScaleModePage({
  params,
  searchParams,
}: {
  params: Promise<{ family: string; mode: string }>;
  searchParams: Promise<{ variant?: string | string[] }>;
}) {
  const { family: familyId, mode: modeId } = await params;
  const family = getFamily(familyId);
  if (!family || !getMode(family, modeId)) notFound();

  const { variant } = await searchParams;
  const variantId = Array.isArray(variant) ? variant[0] : variant;

  return <ScalePage family={family} modeId={modeId} variantId={variantId} />;
}
