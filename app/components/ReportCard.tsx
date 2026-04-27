type SubjectMark = {
  subject_name: string;
  score: number;
  teacher_comment?: string | null;
};

type ReportSummary = {
  pupil_name: string;
  class_name: string;
  total_score: number;
  average_score: number;
  position: number | null;
  uneb_grade: string | null;
  teacher_remark?: string | null;
};

type Props = {
  summary: ReportSummary;
  subjects: SubjectMark[];
};

const scoreToGrade = (score: number) => {
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  if (score >= 40) return "D";
  return "F";
};

const gradeColor = (grade: string) => {
  if (grade === "A") return { bg: "#d1f0dc", color: "#0a4f24" };
  if (grade === "B") return { bg: "#d0e8ff", color: "#0a3a6b" };
  if (grade === "C") return { bg: "#fff3cd", color: "#7a5300" };
  if (grade === "D") return { bg: "#fde0e0", color: "#7a1111" };
  return { bg: "#fde0e0", color: "#7a1111" };
};

const renderCheckbox = (checked: boolean) => (
  <div
    style={{
      width: "18px",
      height: "18px",
      border: "2px solid #1a6b3c",
      borderRadius: "3px",
      background: checked ? "#1a6b3c" : "transparent",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {checked && (
      <span style={{ color: "#fff", fontSize: "12px", fontWeight: 700 }}>✓</span>
    )}
  </div>
);

const scoreToLevel = (score: number) => {
  if (score >= 90) return 5;
  if (score >= 75) return 4;
  if (score >= 60) return 3;
  if (score >= 45) return 2;
  if (score >= 25) return 1;
  return 0;
};

const nurserySubjects = [
  "Readiness",
  "Reading",
  "Writing",
  "Spelling",
  "Arithmetic",
  "Nature Study",
  "Art",
  "Music",
  "Physical Education",
  "Behaviour",
  "Attendance",
];

const primarySubjects = [
  "Religious Education",
  "English",
  "Mathematics",
  "Science",
  "History",
  "Geography",
  "Art",
  "Music",
  "Physical Education",
  "Behaviour",
  "Attendance",
];

export default function ReportCard({ summary, subjects }: Props) {
  const isNursery = summary.class_name?.startsWith("KG");
  const isP7 = summary.class_name?.startsWith("P7");

  if (isNursery) {
    const subjectScores = new Map(subjects.map((s) => [s.subject_name, s.score]));

    return (
      <div className="report-card">
        <button
          className="btn btn-primary no-print"
          onClick={() => window.print()}
          style={{ display: "block", margin: "0 auto 20px", padding: "9px 24px" }}
        >
          Print / Save as PDF
        </button>
        <h1 style={{ fontSize: "24px", textAlign: "center", color: "#1a6b3c", marginBottom: "3px" }}>
          Hill View Primary School
        </h1>
        <div style={{ textAlign: "center", fontSize: "12px", color: "#777", marginBottom: "22px" }}>
          Academic Report Card &nbsp;|&nbsp; Term 2, 2025
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px", padding: "14px", background: "#f0f8f4", borderRadius: "8px", marginBottom: "20px" }}>
          <div>
            <span style={{ fontSize: "11px", color: "#777", textTransform: "uppercase", letterSpacing: ".04em" }}>Pupil</span>
            <strong style={{ display: "block", fontSize: "18px", fontWeight: 700, color: "#1a6b3c" }}>{summary.pupil_name}</strong>
          </div>
          <div>
            <span style={{ fontSize: "11px", color: "#777", textTransform: "uppercase", letterSpacing: ".04em" }}>Class</span>
            <strong style={{ display: "block", fontSize: "18px", fontWeight: 700, color: "#1a6b3c" }}>{summary.class_name}</strong>
          </div>
          <div>
            <span style={{ fontSize: "11px", color: "#777", textTransform: "uppercase", letterSpacing: ".04em" }}>Level</span>
            <strong style={{ display: "block", fontSize: "18px", fontWeight: 700, color: "#1a6b3c" }}>Nursery</strong>
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr>
              <th style={{ background: "#1a6b3c", color: "#fff", padding: "9px 12px", textAlign: "left", fontWeight: 500 }}>Learning Area</th>
              <th style={{ background: "#1a6b3c", color: "#fff", padding: "9px 12px", textAlign: "center", fontWeight: 500, width: "60px" }}>1</th>
              <th style={{ background: "#1a6b3c", color: "#fff", padding: "9px 12px", textAlign: "center", fontWeight: 500, width: "60px" }}>2</th>
              <th style={{ background: "#1a6b3c", color: "#fff", padding: "9px 12px", textAlign: "center", fontWeight: 500, width: "60px" }}>3</th>
              <th style={{ background: "#1a6b3c", color: "#fff", padding: "9px 12px", textAlign: "center", fontWeight: 500, width: "60px" }}>4</th>
              <th style={{ background: "#1a6b3c", color: "#fff", padding: "9px 12px", textAlign: "center", fontWeight: 500, width: "60px" }}>5</th>
            </tr>
          </thead>
          <tbody>
            {nurserySubjects.map((subject) => {
              const score = subjectScores.get(subject) ?? 0;
              const level = scoreToLevel(score);
              return (
                <tr key={subject}>
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid #eee", fontSize: "13px" }}>{subject}</td>
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid #eee", textAlign: "center" }}>{renderCheckbox(level >= 1)}</td>
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid #eee", textAlign: "center" }}>{renderCheckbox(level >= 2)}</td>
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid #eee", textAlign: "center" }}>{renderCheckbox(level >= 3)}</td>
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid #eee", textAlign: "center" }}>{renderCheckbox(level >= 4)}</td>
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid #eee", textAlign: "center" }}>{renderCheckbox(level >= 5)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div style={{ marginTop: "16px", padding: "12px", background: "#f0f8f4", borderRadius: "8px", fontSize: "11px" }}>
          <strong style={{ color: "#1a6b3c", marginRight: "16px" }}>Levels:</strong>
          <span style={{ marginRight: "12px" }}>1 = Beginning</span>
          <span style={{ marginRight: "12px" }}>2 = Developing</span>
          <span style={{ marginRight: "12px" }}>3 = Approaching</span>
          <span style={{ marginRight: "12px" }}>4 = Meeting</span>
          <span>5 = Exceeding</span>
        </div>

        <footer style={{ marginTop: "24px", paddingTop: "12px", borderTop: "1px solid #e0e0e0", fontSize: "11px", color: "#aaa", textAlign: "center" }}>
          Generated by Hill View School Report Management System
        </footer>
      </div>
    );
  }

  const subjectScores = new Map(subjects.map((s) => [s.subject_name, s.score]));

  return (
    <div className="report-card">
      <button
        className="btn btn-primary no-print"
        onClick={() => window.print()}
        style={{ display: "block", margin: "0 auto 20px", padding: "9px 24px" }}
      >
        Print / Save as PDF
      </button>
      <h1 style={{ fontSize: "24px", textAlign: "center", color: "#1a6b3c", marginBottom: "3px" }}>
        Hill View Primary School
      </h1>
      <div style={{ textAlign: "center", fontSize: "12px", color: "#777", marginBottom: "22px" }}>
        Academic Report Card &nbsp;|&nbsp; Term 2, 2025
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px", padding: "14px", background: "#f0f8f4", borderRadius: "8px", marginBottom: "20px" }}>
        <div>
          <span style={{ fontSize: "11px", color: "#777", textTransform: "uppercase", letterSpacing: ".04em" }}>Pupil</span>
          <strong style={{ display: "block", fontSize: "18px", fontWeight: 700, color: "#1a6b3c" }}>{summary.pupil_name}</strong>
        </div>
        <div>
          <span style={{ fontSize: "11px", color: "#777", textTransform: "uppercase", letterSpacing: ".04em" }}>Class</span>
          <strong style={{ display: "block", fontSize: "18px", fontWeight: 700, color: "#1a6b3c" }}>{summary.class_name}</strong>
        </div>
        <div>
          <span style={{ fontSize: "11px", color: "#777", textTransform: "uppercase", letterSpacing: ".04em" }}>Position</span>
          <strong style={{ display: "block", fontSize: "18px", fontWeight: 700, color: "#1a6b3c" }}>{summary.position ?? "–"}</strong>
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          <tr>
            <th style={{ background: "#1a6b3c", color: "#fff", padding: "9px 12px", textAlign: "left", fontWeight: 500 }}>Subject</th>
            <th style={{ background: "#1a6b3c", color: "#fff", padding: "9px 12px", textAlign: "center", fontWeight: 500, width: "50px" }}>A</th>
            <th style={{ background: "#1a6b3c", color: "#fff", padding: "9px 12px", textAlign: "center", fontWeight: 500, width: "50px" }}>B</th>
            <th style={{ background: "#1a6b3c", color: "#fff", padding: "9px 12px", textAlign: "center", fontWeight: 500, width: "50px" }}>C</th>
            <th style={{ background: "#1a6b3c", color: "#fff", padding: "9px 12px", textAlign: "center", fontWeight: 500, width: "50px" }}>D</th>
            <th style={{ background: "#1a6b3c", color: "#fff", padding: "9px 12px", textAlign: "center", fontWeight: 500, width: "50px" }}>F</th>
            <th style={{ background: "#1a6b3c", color: "#fff", padding: "9px 12px", textAlign: "left", fontWeight: 500 }}>Comment</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((subject) => {
            const score = subjectScores.get(subject.subject_name) ?? 0;
            const grade = scoreToGrade(score);
            const colors = gradeColor(grade);
            const comment = subject.teacher_comment;
            return (
              <tr key={subject.subject_name}>
                <td style={{ padding: "8px 12px", borderBottom: "1px solid #eee", fontSize: "13px" }}>{subject.subject_name}</td>
                <td style={{ padding: "8px 12px", borderBottom: "1px solid #eee", textAlign: "center" }}>
                  {renderCheckbox(grade === "A")}
                </td>
                <td style={{ padding: "8px 12px", borderBottom: "1px solid #eee", textAlign: "center" }}>
                  {renderCheckbox(grade === "B")}
                </td>
                <td style={{ padding: "8px 12px", borderBottom: "1px solid #eee", textAlign: "center" }}>
                  {renderCheckbox(grade === "C")}
                </td>
                <td style={{ padding: "8px 12px", borderBottom: "1px solid #eee", textAlign: "center" }}>
                  {renderCheckbox(grade === "D")}
                </td>
                <td style={{ padding: "8px 12px", borderBottom: "1px solid #eee", textAlign: "center" }}>
                  {renderCheckbox(grade === "F")}
                </td>
                <td style={{ padding: "8px 12px", borderBottom: "1px solid #eee", fontSize: "12px", color: "#555", fontStyle: "italic" }}>
                  {comment || ""}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px", padding: "14px", background: "#f0f8f4", borderRadius: "8px", marginTop: "16px" }}>
        <div>
          <span style={{ fontSize: "11px", color: "#777", textTransform: "uppercase", letterSpacing: ".04em" }}>Total Score</span>
          <strong style={{ display: "block", fontSize: "18px", fontWeight: 700, color: "#1a6b3c" }}>{summary.total_score}</strong>
        </div>
        <div>
          <span style={{ fontSize: "11px", color: "#777", textTransform: "uppercase", letterSpacing: ".04em" }}>Average</span>
          <strong style={{ display: "block", fontSize: "18px", fontWeight: 700, color: "#1a6b3c" }}>{summary.average_score.toFixed(1)}%</strong>
        </div>
        <div>
          <span style={{ fontSize: "11px", color: "#777", textTransform: "uppercase", letterSpacing: ".04em" }}>Position</span>
          <strong style={{ display: "block", fontSize: "18px", fontWeight: 700, color: "#1a6b3c" }}>{summary.position ?? "–"}</strong>
        </div>
      </div>

      {isP7 && summary.uneb_grade && (
        <div style={{ marginTop: "20px", padding: "14px", background: "#f0f8f4", borderRadius: "8px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#1a6b3c", marginBottom: "10px" }}>UNEB PLE Grade (P7)</h3>
          <span
            style={{
              display: "inline-block",
              padding: "5px 18px",
              borderRadius: "20px",
              fontSize: "17px",
              fontWeight: 700,
              background: summary.uneb_grade.startsWith("D")
                ? "#d1f0dc"
                : summary.uneb_grade.startsWith("C")
                ? "#d0e8ff"
                : summary.uneb_grade.startsWith("P")
                ? "#fff3cd"
                : "#fde0e0",
              color: summary.uneb_grade.startsWith("D")
                ? "#0a4f24"
                : summary.uneb_grade.startsWith("C")
                ? "#0a3a6b"
                : summary.uneb_grade.startsWith("P")
                ? "#7a5300"
                : "#7a1111",
            }}
          >
            {summary.uneb_grade}
          </span>
        </div>
      )}

      {summary.teacher_remark && (
        <div style={{ marginTop: "20px", padding: "14px", background: "#f0f8f4", borderRadius: "8px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#1a6b3c", marginBottom: "8px" }}>Class Teacher's Remark</h3>
          <p style={{ fontSize: "14px", lineHeight: 1.6, color: "#333" }}>{summary.teacher_remark}</p>
        </div>
      )}

      <footer style={{ marginTop: "24px", paddingTop: "12px", borderTop: "1px solid #e0e0e0", fontSize: "11px", color: "#aaa", textAlign: "center" }}>
        Generated by Hill View School Report Management System
      </footer>
    </div>
  );
}