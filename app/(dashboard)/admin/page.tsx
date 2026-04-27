import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { requireUser } from "../../lib/auth";
import AdminDashboardClient from "../../components/AdminDashboardClient";

export default async function AdminDashboard() {
  noStore();
  const user = await requireUser();
  if (user.role !== "admin") {
    redirect("/teacher");
  }

  return <AdminDashboardClient />;
}