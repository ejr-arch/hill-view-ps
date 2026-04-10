import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { requireUser } from "../lib/auth";

export default async function DashboardRouter() {
  noStore();
  const user = await requireUser();

  if (user.role === "admin") {
    redirect("/admin");
  }

  redirect("/teacher");
}
