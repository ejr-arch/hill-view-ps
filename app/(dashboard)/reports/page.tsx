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
    return <p>No pupil data available.</p>;
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
    <section className="dashboard">
      <div className="dashboard-header">
        <div>
          <h2>Report Cards</h2>
          <p>Select a pupil to generate a printable report card.</p>
        </div>
        <PrintButton />
      </div>

      <div className="report-layout">
        <aside>
          <h4>Pupils</h4>
          <ul className="pupil-list">
            {pupils?.map((pupil) => (
              <li key={pupil.pupil_id}>
                <a
                  className={
                    pupil.pupil_id === selectedPupilId ? "active" : ""
                  }
                  href={`/reports?pupil=${pupil.pupil_id}`}
                >
                  <span>{pupil.pupil_name}</span>
                  <small>{pupil.class_name}</small>
                </a>
              </li>
            )) ?? null}
          </ul>
        </aside>
        <div>
          {summary ? (
            <ReportCard summary={summary} subjects={subjectMarks ?? []} />
          ) : (
            <p>No report data for the selected pupil.</p>
          )}
        </div>
      </div>
    </section>
  );
}
