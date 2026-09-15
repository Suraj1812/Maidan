"use server";

import { searchProfiles, searchSquads } from "@/lib/data";

export async function searchProfilesClient(query: string) {
  return searchProfiles(query);
}

export async function searchSquadsClient(query: string) {
  return searchSquads(query);
}
