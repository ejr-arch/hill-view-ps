"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MarksEntryClient from "./MarksEntryClient";

type Pupil = {
  id: string;
  name: string;
};

type Subject = {
  id: string;
  name: string;
};

type Mark = {
  id: string;
  pupil_id: string;
  subject_id: string;
  score: number;
};

type DashboardPayload = {
  user: {
    id: string;
    email: string;
    name: string;
    classId: string | null;
  };
  classInfo: {
    id: string;
    name: string;
  } | null;
  pupils: Pupil[];
  subjects: Subject[];
  marks: Mark[];
  performance: {
    class_name: string;
    average_score: number;
    best_pupil: string | null;
    weakest_pupil: string | null;
  } | null;
};

export default function TeacherDashboardClient() {
  const router = useRouter();
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/teacher/dashboard", {
        cache: "no-store"
      });

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      if (response.status === 403) {
        router.replace("/admin");
        return;
      }

      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Failed to load teacher dashboard.");
        setLoading(false);
        return;
      }

      setData(payload);
      setLoading(false);
    };

    loadDashboard();
  }, [router]);

  if (loading) {
    return <p className="muted">Loading teacher dashboard...</p>;
  }

  if (error || !data) {
    return <p className="error">{error ?? "Teacher dashboard is unavailable."}</p>;
  }

  return (
    <section className="dashboard">
      <div className="dashboard-header">
        <div>
          <h2>Teacher Dashboard</h2>
          <p>
            {data.classInfo?.name ?? "Unassigned Class"} | Enter marks and review
            class performance.
          </p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Class Average</div>
          <div className="stat-value">
            {data.performance?.average_score?.toFixed(1) ?? "-"}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Best Pupil</div>
          <div className="stat-value">{data.performance?.best_pupil ?? "-"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Needs Support</div>
          <div className="stat-value">
            {data.performance?.weakest_pupil ?? "-"}
          </div>
        </div>
      </div>

      <div className="panel">
        <h3>Enter Marks</h3>
        <p className="muted">
          Teacher: {data.user.email} | Class ID: {data.user.classId ?? "none"} |
          Pupils: {data.pupils.length} | Subjects: {data.subjects.length} |
          Marks: {data.marks.length}
        </p>
        <MarksEntryClient
          classId={data.user.classId ?? ""}
          pupils={data.pupils}
          subjects={data.subjects}
          marks={data.marks}
        />
      </div>
    </section>
  );
}
