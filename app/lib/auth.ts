import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { supabaseServer } from "./supabaseServer";

export type UserRole = "admin" | "teacher";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  class_id: string | null;
};

export const requireUser = async () => {
  noStore();
  const supabase = supabaseServer();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, role, class_id")
    .eq("id", user.id)
    .single<AppUser>();

  if (error || !data) {
    redirect("/login");
  }

  return data;
};
