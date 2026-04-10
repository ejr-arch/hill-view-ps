type SubjectMark = {
  subject_name: string;
  score: number;
};

type ReportSummary = {
  pupil_name: string;
  class_name: string;
  total_score: number;
  average_score: number;
  position: number | null;
  uneb_grade: string | null;
};

type Props = {
  summary: ReportSummary;
  subjects: SubjectMark[];
};

export default function ReportCard({ summary, subjects }: Props) {
  return (
    <div className="report-card">
      <header>
        <h2>Report Card</h2>
        <div className="report-meta">
          <div>
            <span>Pupil</span>
            <strong>{summary.pupil_name}</strong>
          </div>
          <div>
            <span>Class</span>
            <strong>{summary.class_name}</strong>
          </div>
          <div>
            <span>Position</span>
            <strong>{summary.position ?? "-"}</strong>
          </div>
        </div>
      </header>

      <table>
        <thead>
          <tr>
            <th>Subject</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((subject) => (
            <tr key={subject.subject_name}>
              <td>{subject.subject_name}</td>
              <td>{subject.score}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <footer>
        <div>
          <span>Total</span>
          <strong>{summary.total_score}</strong>
        </div>
        <div>
          <span>Average</span>
          <strong>{summary.average_score.toFixed(1)}</strong>
        </div>
        <div>
          <span>UNEB Grade (P7)</span>
          <strong>{summary.uneb_grade ?? "N/A"}</strong>
        </div>
      </footer>
    </div>
  );
}
