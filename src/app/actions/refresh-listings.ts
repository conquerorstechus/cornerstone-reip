"use server";

import { updateTag } from "next/cache";
import { LISTINGS_CACHE_TAG } from "@/lib/sam-list";

/** Drop the cached listings JSON so the next render fetches the webhook again. */
export async function refreshListingsCache() {
  updateTag(LISTINGS_CACHE_TAG);
}
