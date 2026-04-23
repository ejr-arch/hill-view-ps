import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import ReportCard from "../../components/ReportCard";
import PrintButton from "../../components/PrintButton";
import { requireUser } from "../../lib/auth";
import { supabaseServer } from "../../lib/supabaseServer";

export default async function ReportsPage({
  searchParams
}: {
  searchParams: { pupil?: string };
}) {
  noStore();
  const user = await requireUser();
  if (user.role !== "admin") {
    redirect("/teacher");
  }

  const supabase = supabaseServer();
  const { data: pupils } = await supabase
    .from("pupil_report_summary")
    .select("pupil_id, pupil_name, class_name")
    .order("class_name")
    .order("pupil_name");

  const selectedPupilId = searchParams.pupil ?? pupils?.[0]?.pupil_id;

  if (!selectedPupilId) {
    return <div className="empty">No pupil data available.</div>;
  }

  const [{ data: summary }, { data: subjectMarks }] = await Promise.all([
    supabase
      .from("pupil_report_summary")
      .select(
        "pupil_id, pupil_name, class_name, total_score, average_score, position, uneb_grade"
      )
      .eq("pupil_id", selectedPupilId)
      .single(),
    supabase
      .from("pupil_report_subjects")
      .select("subject_name, score")
      .eq("pupil_id", selectedPupilId)
  ]);

  return (
    <section>
      <div className="hdr-row">
        <h2 className="page-h">Report Cards</h2>
        <PrintButton />
      </div>

      <div className="two-col">
        <div className="card" style={{ padding: "16px" }}>
          <h3 className="section-h">Select Pupil</h3>
          <div className="pupil-list-grid">
            {pupils?.map((pupil) => (
              <a
                key={pupil.pupil_id}
                className={pupil.pupil_id === selectedPupilId ? "active" : ""}
                href={`/reports?pupil=${pupil.pupil_id}`}
                style={{ display: "flex", flexDirection: "column", gap: "2px" }}
              >
                <span style={{ fontWeight: 500 }}>{pupil.pupil_name}</span>
                <span style={{ fontSize: "11px", color: "var(--muted)" }}>{pupil.class_name}</span>
              </a>
            )) ?? null}
          </div>
        </div>
        <div>
          {summary ? (
            <ReportCard summary={summary} subjects={subjectMarks ?? []} />
          ) : (
            <div className="empty">No report data for the selected pupil.</div>
          )}
        </div>
      </div>
    </section>
  );
}