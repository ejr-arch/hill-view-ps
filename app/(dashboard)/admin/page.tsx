import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
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
    .select("class_name, average_score, best_pupil")
    .order("class_name");

  const schoolAvg = performance?.length
    ? (performance.reduce((sum, r) => sum + (r.average_score || 0), 0) / performance.length).toFixed(1) + "%"
    : "–";

  return (
    <section>
      <h2 className="page-h">School Overview</h2>

      <div className="mc-grid">
        <div className="mc">
          <div className="mc-val">{pupils?.length ?? 0}</div>
          <div className="mc-lbl">Total Pupils</div>
        </div>
        <div className="mc">
          <div className="mc-val">{classes?.length ?? 0}</div>
          <div className="mc-lbl">Classes</div>
        </div>
        <div className="mc">
          <div className="mc-val">{schoolAvg}</div>
          <div className="mc-lbl">School Average</div>
        </div>
        <div className="mc">
          <div className="mc-val">{submissions?.length ?? 0}</div>
          <div className="mc-lbl">Teacher Submissions</div>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <h3 className="section-h">Class Performance</h3>
          <div className="tbl-wrap">
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
                    <td><span className="pill">{row.class_name}</span></td>
                    <td style={{ fontWeight: 600, color: "var(--g)" }}>{Number(row.average_score || 0).toFixed(1)}%</td>
                  </tr>
                )) ?? null}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <h3 className="section-h">Top Performers</h3>
          {performance?.slice(0, 6).map((row) => (
            <div key={row.class_name} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "9px" }}>
              <span className="pill" style={{ minWidth: "80px", textAlign: "center" }}>{row.class_name}</span>
              <span style={{ flex: 1, fontSize: "13px", fontWeight: 500 }}>{row.best_pupil || "–"}</span>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--g)" }}>{Number(row.average_score || 0).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 className="section-h">Teacher Submission Status</h3>
        {submissions?.length ? (
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Teacher</th>
                  <th>Class</th>
                  <th>Subjects Entered</th>
                  <th>Progress</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((row) => {
                  const pct = row.subjects_entered > 0 ? Math.round(row.subjects_entered * 100 / 8) : 0;
                  return (
                    <tr key={`${row.teacher_name}-${row.class_name}`}>
                      <td>{row.teacher_name}</td>
                      <td>{row.class_name}</td>
                      <td>{row.subjects_entered}</td>
                      <td>
                        <div className="sub-bar" style={{ width: "100px" }}>
                          <div className="sub-fill" style={{ width: `${pct}%` }}></div>
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "2px" }}>{pct}%</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty">No submission data yet.</div>
        )}
      </div>
    </section>
  );
}