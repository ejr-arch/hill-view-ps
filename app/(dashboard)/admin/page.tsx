import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import StatCard from "../../components/StatCard";
import { requireUser } from "../../lib/auth";
import { supabaseServer } from "../../lib/supabaseServer";

export default async function AdminDashboard() {
  noStore();
  const user = await requireUser();
  if (user.role !== "admin") {
    redirect("/teacher");
  }

  const supabase = supabaseServer();

  const [{ data: classes }, { data: teachers }, { data: pupils }] =
    await Promise.all([
      supabase.from("classes").select("id"),
      supabase.from("users").select("id").eq("role", "teacher"),
      supabase.from("pupils").select("id")
    ]);

  const { data: submissions } = await supabase
    .from("teacher_submission_status")
    .select("teacher_name, class_name, subjects_entered")
    .order("class_name");

  const { data: performance } = await supabase
    .from("class_performance")
    .select("class_name, average_score")
    .order("class_name");

  return (
    <section className="dashboard">
      <div className="dashboard-header">
        <div>
          <h2>Admin Dashboard</h2>
          <p>Welcome, {user.name}. Manage the entire school in one view.</p>
        </div>
        <a className="button primary" href="/reports">
          Generate Reports
        </a>
      </div>

      <div className="stat-grid">
        <StatCard label="Classes" value={classes?.length ?? 0} />
        <StatCard label="Teachers" value={teachers?.length ?? 0} />
        <StatCard label="Pupils" value={pupils?.length ?? 0} />
        <StatCard
          label="Submissions"
          value={submissions?.length ?? 0}
          helper="Teachers with marks entered"
        />
      </div>

      <div className="panel-grid">
        <div className="panel">
          <h3>Class Performance</h3>
          <table>
            <thead>
              <tr>
                <th>Class</th>
                <th>Average Score</th>
              </tr>
            </thead>
            <tbody>
              {performance?.map((row) => (
                <tr key={row.class_name}>
                  <td>{row.class_name}</td>
                  <td>{row.average_score?.toFixed(1)}</td>
                </tr>
              )) ?? null}
            </tbody>
          </table>
        </div>
        <div className="panel">
          <h3>Teacher Submission Status</h3>
          <table>
            <thead>
              <tr>
                <th>Teacher</th>
                <th>Class</th>
                <th>Subjects Entered</th>
              </tr>
            </thead>
            <tbody>
              {submissions?.map((row) => (
                <tr key={`${row.teacher_name}-${row.class_name}`}>
                  <td>{row.teacher_name}</td>
                  <td>{row.class_name}</td>
                  <td>{row.subjects_entered}</td>
                </tr>
              )) ?? null}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
