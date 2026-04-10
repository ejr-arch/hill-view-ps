"use client";

import { useState } from "react";
import { supabaseBrowser } from "../lib/supabaseBrowser";

type Pupil = {
  id: string;
  name: string;
};

type Props = {
  classId: string;
  pupils: Pupil[];
};

export default function PupilManagerClient({ classId, pupils }: Props) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleAdd = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const trimmed = name.trim();
    if (!trimmed) {
      setMessage("Enter a pupil name.");
      setSaving(false);
      return;
    }

    const supabase = supabaseBrowser();
    const { error } = await supabase
      .from("pupils")
      .insert({ name: trimmed, class_id: classId });

    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

    setName("");
    setMessage("Pupil added. Refresh to see the list.");
    setSaving(false);
  };

  return (
    <div className="panel">
      <h3>Pupils in Class</h3>
      <ul className="pupil-list-grid">
        {pupils.map((pupil) => (
          <li key={pupil.id}>{pupil.name}</li>
        ))}
      </ul>
      <form onSubmit={handleAdd} className="pupil-form">
        <input
          type="text"
          placeholder="New pupil name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <button className="button primary" type="submit" disabled={saving}>
          {saving ? "Adding..." : "Add Pupil"}
        </button>
      </form>
      {message ? <div className="muted">{message}</div> : null}
    </div>
  );
}
