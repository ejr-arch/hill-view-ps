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

const scoreToDots = (score: number) => {
  if (score >= 90) return 5;
  if (score >= 75) return 4;
  if (score >= 60) return 3;
  if (score >= 45) return 2;
  if (score >= 25) return 1;
  return 0;
};

const dotLabel = (filled: number) => {
  const labels = ["Beginning", "Developing", "Approaching", "Meeting", "Exceeding"];
  return labels[Math.min(filled, 4)] || "Beginning";
};

const renderDots = (filled: number) => {
  const dots = [];
  for (let i = 0; i < 5; i++) {
    dots.push(
      <span
        key={i}
        style={{
          display: "inline-block",
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          border: "2px solid #1a6b3c",
          background: i < filled ? "#1a6b3c" : "transparent",
          boxSizing: "border-box",
        }}
      />
    );
  }
  return dots;
};

const scoreColor = (score: number) => {
  if (score >= 80) return "#0a4f24";
  if (score >= 60) return "#0a3a6b";
  if (score >= 40) return "#7a5300";
  return "#c0392b";
};

const scoreLabel = (score: number) => {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Average";
  return "Needs Improvement";
};

export default function ReportCard({ summary, subjects }: Props) {
  const isNursery = summary.class_name?.startsWith("KG");
  const isP7 = summary.class_name?.startsWith("P7");

  if (isNursery) {
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

        <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap", padding: "12px 14px", background: "#f0f8f4", borderRadius: "8px", marginBottom: "20px", fontSize: "12px", color: "#555" }}>
          <strong style={{ color: "#1a6b3c", fontSize: "11px", textTransform: "uppercase", letterSpacing: ".05em", marginRight: "4px" }}>Scale:</strong>
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {renderDots(n)}
              <span>{n} — {dotLabel(n)}</span>
            </div>
          ))}
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr>
              <th style={{ background: "#1a6b3c", color: "#fff", padding: "9px 12px", textAlign: "left", fontWeight: 500 }}>Learning Area</th>
              <th style={{ background: "#1a6b3c", color: "#fff", padding: "9px 12px", textAlign: "center", fontWeight: 500 }}>Achievement</th>
              <th style={{ background: "#1a6b3c", color: "#fff", padding: "9px 12px", textAlign: "left", fontWeight: 500 }}>Level</th>
              <th style={{ background: "#1a6b3c", color: "#fff", padding: "9px 12px", textAlign: "center", fontWeight: 500 }}>Score</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject) => {
              const filled = scoreToDots(subject.score);
              return (
                <tr key={subject.subject_name}>
                  <td style={{ padding: "9px 12px", borderBottom: "1px solid #eee", fontSize: "13px" }}>{subject.subject_name}</td>
                  <td style={{ padding: "9px 12px", borderBottom: "1px solid #eee", textAlign: "center" }}>
                    <div style={{ display: "flex", gap: "6px", justifyContent: "center", alignItems: "center" }}>
                      {renderDots(filled)}
                    </div>
                  </td>
                  <td style={{ padding: "9px 12px", borderBottom: "1px solid #eee", fontSize: "12px", color: "#555" }}>{dotLabel(filled)}</td>
                  <td style={{ padding: "9px 12px", borderBottom: "1px solid #eee", textAlign: "center", fontSize: "13px", fontWeight: 700, color: "#1a6b3c" }}>{subject.score}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <footer style={{ marginTop: "24px", paddingTop: "12px", borderTop: "1px solid #e0e0e0", fontSize: "11px", color: "#aaa", textAlign: "center" }}>
          Generated by Hill View School Report Management System
        </footer>
      </div>
    );
  }

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
            <th style={{ background: "#1a6b3c", color: "#fff", padding: "9px 12px", textAlign: "center", fontWeight: 500 }}>Score</th>
            <th style={{ background: "#1a6b3c", color: "#fff", padding: "9px 12px", textAlign: "center", fontWeight: 500 }}>/ 100</th>
            <th style={{ background: "#1a6b3c", color: "#fff", padding: "9px 12px", textAlign: "left", fontWeight: 500 }}>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((subject) => (
            <tr key={subject.subject_name}>
              <td style={{ padding: "8px 12px", borderBottom: "1px solid #eee" }}>{subject.subject_name}</td>
              <td style={{ padding: "8px 12px", borderBottom: "1px solid #eee", textAlign: "center", fontWeight: 700, color: scoreColor(subject.score) }}>{subject.score}</td>
              <td style={{ padding: "8px 12px", borderBottom: "1px solid #eee", textAlign: "center", color: "#999" }}>100</td>
              <td style={{ padding: "8px 12px", borderBottom: "1px solid #eee", color: scoreColor(subject.score) }}>{scoreLabel(subject.score)}</td>
            </tr>
          ))}
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

      <footer style={{ marginTop: "24px", paddingTop: "12px", borderTop: "1px solid #e0e0e0", fontSize: "11px", color: "#aaa", textAlign: "center" }}>
        Generated by Hill View School Report Management System
      </footer>
    </div>
  );
}