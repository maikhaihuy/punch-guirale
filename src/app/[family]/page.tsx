import { notFound, redirect } from "next/navigation";

import { getFamily } from "@/lib/scales";

// Reserved for future single-mode (symmetric) families, which would render
// directly here instead of redirecting - see design.md "Routing decisions".
// No M4 family has modes.length === 1, so every family currently redirects
// to its first mode.
export default async function FamilyPage({
  params,
}: {
  params: Promise<{ family: string }>;
}) {
  const { family: familyId } = await params;
  const family = getFamily(familyId);
  if (!family) notFound();

  redirect(`/${family.id}/${family.modes[0].id}`);
}
