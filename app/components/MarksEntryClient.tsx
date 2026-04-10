"use client";

import { useEffect, useState } from "react";

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

type Props = {
  classId: string;
  pupils: Pupil[];
  subjects: Subject[];
  marks: Mark[];
};

export default function MarksEntryClient({
  classId,
  pupils,
  subjects,
  marks
}: Props) {
  const keySeparator = "::";
  const [pending, setPending] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pupilList, setPupilList] = useState<Pupil[]>(pupils);
  const [newPupilName, setNewPupilName] = useState("");
  const [markMap, setMarkMap] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    setPupilList(pupils);
  }, [pupils]);

  useEffect(() => {
    const map = new Map<string, number>();
    marks.forEach((mark) => {
      map.set(`${mark.pupil_id}${keySeparator}${mark.subject_id}`, mark.score);
    });
    setMarkMap(map);
  }, [keySeparator, marks]);

  const scoreFor = (pupilId: string, subjectId: string) => {
    const key = `${pupilId}${keySeparator}${subjectId}`;
    const value = pending[key] ?? markMap.get(key);
    return typeof value === "number" ? value : 0;
  };

  const subjectCount = subjects.length || 1;
  const rows = pupilList.map((pupil) => {
    const total = subjects.reduce(
      (sum, subject) => sum + scoreFor(pupil.id, subject.id),
      0
    );
    return { pupilId: pupil.id, total, average: total / subjectCount };
  });
  const sortedRows = [...rows].sort((a, b) => b.average - a.average);
  const positionMap = new Map<string, number>();
  let rank = 1;
  sortedRows.forEach((row, index) => {
    if (index > 0 && row.average < sortedRows[index - 1].average) {
      rank = index + 1;
    }
    positionMap.set(row.pupilId, rank);
  });
  const averages = new Map<string, { total: number; average: number; position: number }>();
  rows.forEach((row) => {
    averages.set(row.pupilId, {
      total: row.total,
      average: row.average,
      position: positionMap.get(row.pupilId) ?? 0
    });
  });

  const handleChange = (key: string, value: string) => {
    if (value === "") {
      setPending((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      return;
    }

    const score = Number(value);
    if (Number.isNaN(score)) return;
    setPending((prev) => ({ ...prev, [key]: score }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    const updates = Object.entries(pending).map(([key, score]) => {
      const [pupil_id, subject_id] = key.split(keySeparator);
      return { pupil_id, subject_id, score };
    });

    if (updates.length === 0) {
      setMessage("No changes to save.");
      setSaving(false);
      return;
    }

    const response = await fetch("/api/teacher/marks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ marks: updates })
    });

    const payload = await response.json();

    if (!response.ok) {
      setMessage(payload.error ?? "Failed to save marks.");
      setSaving(false);
      return;
    }

    setMarkMap((prev) => {
      const next = new Map(prev);
      updates.forEach((update) => {
        next.set(
          `${update.pupil_id}${keySeparator}${update.subject_id}`,
          update.score
        );
      });
      return next;
    });
    setMessage("Marks saved successfully.");
    setPending({});
    setSaving(false);
  };

  const handleAddPupil = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = newPupilName.trim();
    if (!trimmed) {
      setMessage("Enter a pupil name to add.");
      return;
    }
    const response = await fetch("/api/teacher/pupils", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name: trimmed })
    });

    const payload = await response.json();

    if (!response.ok) {
      setMessage(payload.error ?? "Failed to add pupil.");
      return;
    }

    setPupilList((prev) => [...prev, payload.pupil]);
    setNewPupilName("");
  };

  return (
    <div>
      <div className="table-actions">
        <button className="button primary" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Marks"}
        </button>
        {message ? <span className="muted">{message}</span> : null}
      </div>
      {pupilList.length === 0 || subjects.length === 0 ? (
        <div className="muted">
          No pupils or subjects found for this class.
        </div>
      ) : null}
      <div className="table-scroll excel-table">
        <table>
          <thead>
            <tr>
              <th className="sticky-col">Pupil</th>
              {subjects.map((subject) => (
                <th key={subject.id}>{subject.name}</th>
              ))}
              <th>Average</th>
              <th>Position</th>
            </tr>
          </thead>
          <tbody>
            {pupilList.map((pupil) => (
              <tr key={pupil.id}>
                <td className="sticky-col">{pupil.name}</td>
                {subjects.map((subject) => {
                  const key = `${pupil.id}${keySeparator}${subject.id}`;
                  const value =
                    pending[key] ?? markMap.get(key) ?? "";
                  return (
                    <td key={subject.id}>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={value}
                        onChange={(event) =>
                          handleChange(key, event.target.value)
                        }
                        className="excel-input"
                      />
                    </td>
                  );
                })}
                <td className="summary-cell">
                  {averages.get(pupil.id)?.average.toFixed(1) ?? "-"}
                </td>
                <td className="summary-cell">
                  {averages.get(pupil.id)?.position || "-"}
                </td>
              </tr>
            ))}
            <tr className="add-row">
              <td className="sticky-col" colSpan={subjects.length + 3}>
                <form onSubmit={handleAddPupil} className="inline-form">
                  <input
                    type="text"
                    placeholder="Add new pupil and start entering marks"
                    value={newPupilName}
                    onChange={(event) => setNewPupilName(event.target.value)}
                  />
                  <button className="button ghost" type="submit">
                    Add Pupil
                  </button>
                </form>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
