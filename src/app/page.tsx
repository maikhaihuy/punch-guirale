import { redirect } from "next/navigation";

import { DEFAULT_FAMILY_ID, DEFAULT_MODE_ID } from "@/lib/scales";

export default function RootPage() {
  redirect(`/${DEFAULT_FAMILY_ID}/${DEFAULT_MODE_ID}`);
}
