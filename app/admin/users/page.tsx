import { createServiceClient } from "@/lib/supabase";
import { UsersClient } from "./UsersClient";
import type { Profile } from "@/lib/database.types";

async function getUsers(): Promise<Profile[]> {
  const sb = createServiceClient();
  const { data } = await sb.from("profiles").select("*").order("full_name");
  return (data ?? []) as Profile[];
}

export default async function UsersPage() {
  const users = await getUsers();
  return <UsersClient initialUsers={users} />;
}
