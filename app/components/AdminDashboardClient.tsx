"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "../lib/supabaseBrowser";

type Class = { id: string; name: string };
type Teacher = { id: string; name: string; email: string; role: string };
type Pupil = { id: string; name: string; class_id: string; avatar?: string; house?: string; paycode?: string };
type TeacherClass = { id: string; teacher_id: string; class_id: string; classes?: { name: string } };

export default function AdminDashboardClient() {
  const [activeTab, setActiveTab] = useState<"classes" | "teachers" | "pupils" | "assignments">("classes");
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [pupils, setPupils] = useState<Pupil[]>([]);
  const [teacherClasses, setTeacherClasses] = useState<TeacherClass[]>([]);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadClasses(), loadTeachers(), loadPupils(), loadTeacherClasses()]);
    setLoading(false);
  };

  const loadClasses = async () => {
    const res = await fetch("/api/classes");
    const data = await res.json();
    if (data.classes) setClasses(data.classes);
  };

  const loadTeachers = async () => {
    const res = await fetch("/api/admin/teachers");
    const data = await res.json();
    if (Array.isArray(data)) setTeachers(data);
  };

  const loadPupils = async () => {
    const res = await fetch("/api/pupils");
    const data = await res.json();
    if (data.pupils) setPupils(data.pupils);
  };

  const loadTeacherClasses = async () => {
    const res = await fetch("/api/admin/teacher-classes");
    const data = await res.json();
    if (Array.isArray(data)) setTeacherClasses(data);
  };

  const showMessage = (type: "ok" | "err", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAddClass = async (name: string) => {
    if (!name.trim()) return;
    const res = await fetch("/api/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (res.ok) {
      setClasses((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      showMessage("ok", "Class added successfully");
    } else {
      showMessage("err", data.error || "Failed to add class");
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (!confirm("Delete this class? Pupils in this class will also be affected.")) return;
    const res = await fetch(`/api/classes?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setClasses((prev) => prev.filter((c) => c.id !== id));
      showMessage("ok", "Class deleted");
    } else {
      const data = await res.json();
      showMessage("err", data.error || "Failed to delete");
    }
  };

  const handleAddTeacher = async (name: string, email: string, role: string) => {
    if (!name.trim() || !email.trim()) return;
    const res = await fetch("/api/admin/teachers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, role }),
    });
    const data = await res.json();
    if (res.ok) {
      setTeachers((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      showMessage("ok", `${role || "Teacher"} added successfully`);
    } else {
      showMessage("err", data.error || "Failed to add user");
    }
  };

  const handleAddPupil = async (name: string, classId: string, house: string, paycode: string) => {
    if (!name.trim() || !classId) return;
    const res = await fetch("/api/pupils", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, class_id: classId, house, paycode }),
    });
    const data = await res.json();
    if (res.ok) {
      setPupils((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      showMessage("ok", "Pupil added successfully");
    } else {
      showMessage("err", data.error || "Failed to add pupil");
    }
  };

  const handleDeletePupil = async (id: string) => {
    if (!confirm("Delete this pupil?")) return;
    const res = await fetch(`/api/pupils?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setPupils((prev) => prev.filter((p) => p.id !== id));
      showMessage("ok", "Pupil deleted");
    } else {
      const data = await res.json();
      showMessage("err", data.error || "Failed to delete");
    }
  };

  const handleAssignTeacher = async (teacherId: string, classId: string) => {
    const res = await fetch("/api/admin/teacher-classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacher_id: teacherId, class_id: classId }),
    });
    const data = await res.json();
    if (res.ok) {
      await loadTeacherClasses();
      showMessage("ok", "Teacher assigned to class");
    } else {
      showMessage("err", data.error || "Failed to assign");
    }
  };

  const handleUnassignTeacher = async (id: string) => {
    const res = await fetch(`/api/admin/teacher-classes?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setTeacherClasses((prev) => prev.filter((tc) => tc.id !== id));
      showMessage("ok", "Assignment removed");
    } else {
      const data = await res.json();
      showMessage("err", data.error || "Failed to remove");
    }
  };

  const getTeacherName = (teacherId: string) => teachers.find((t) => t.id === teacherId)?.name || teacherId;
  const getClassName = (classId: string) => classes.find((c) => c.id === classId)?.name || classId;
  const getClassPupils = (classId: string) => pupils.filter((p) => p.class_id === classId);

  return (
    <section>
      <h2 className="page-h">Admin Dashboard</h2>

      {message && (
        <div className={`msg-${message.type}`} style={{ marginBottom: "16px" }}>
          {message.text}
        </div>
      )}

      <div className="admin-tabs">
        {(["classes", "teachers", "pupils", "assignments"] as const).map((tab) => (
          <button
            key={tab}
            className={`admin-tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loader">Loading...</div>
      ) : (
        <>
          {activeTab === "classes" && (
            <div className="admin-card">
              <h3 className="section-h">Classes</h3>
              <div className="tbl-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Class Name</th>
                      <th>Pupils</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.map((cls) => (
                      <tr key={cls.id}>
                        <td><span className="pill">{cls.name}</span></td>
                        <td>{getClassPupils(cls.id).length}</td>
                        <td>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDeleteClass(cls.id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="add-form">
                <AddClassForm onAdd={handleAddClass} />
              </div>
            </div>
          )}

          {activeTab === "teachers" && (
            <div className="admin-card">
              <h3 className="section-h">Teachers</h3>
              <div className="tbl-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.map((teacher) => (
                      <tr key={teacher.id}>
                        <td>{teacher.name}</td>
                        <td>{teacher.email}</td>
                        <td><span className="pill">{teacher.role}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="add-form">
                <AddTeacherForm onAdd={handleAddTeacher} />
              </div>
            </div>
          )}

          {activeTab === "pupils" && (
            <div className="admin-card">
              <h3 className="section-h">Pupils</h3>
              <div className="tbl-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Class</th>
                      <th>House</th>
                      <th>Paycode</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pupils.map((pupil) => (
                      <tr key={pupil.id}>
                        <td>{pupil.name}</td>
                        <td><span className="pill">{getClassName(pupil.class_id)}</span></td>
                        <td>{pupil.house || "—"}</td>
                        <td>{pupil.paycode || "—"}</td>
                        <td>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDeletePupil(pupil.id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="add-form">
                <AddPupilForm classes={classes} onAdd={handleAddPupil} />
              </div>
            </div>
          )}

          {activeTab === "assignments" && (
            <div className="admin-card">
              <h3 className="section-h">Teacher-Class Assignments</h3>
              <div className="tbl-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Teacher</th>
                      <th>Class</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teacherClasses.map((tc) => (
                      <tr key={tc.id}>
                        <td>{getTeacherName(tc.teacher_id)}</td>
                        <td><span className="pill">{getClassName(tc.class_id)}</span></td>
                        <td>
                          <button className="btn btn-danger btn-sm" onClick={() => handleUnassignTeacher(tc.id)}>
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                    {teacherClasses.length === 0 && (
                      <tr>
                        <td colSpan={3} className="empty">No assignments yet</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="add-form">
                <AssignTeacherForm teachers={teachers} classes={classes} onAssign={handleAssignTeacher} />
              </div>
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .admin-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .admin-tab {
          padding: 10px 20px;
          border: 1px solid var(--border);
          background: var(--surface);
          border-radius: var(--r);
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          color: var(--muted);
          transition: all 0.15s;
        }
        .admin-tab:hover {
          background: var(--gl);
          color: var(--g);
        }
        .admin-tab.active {
          background: var(--g);
          color: #fff;
          border-color: var(--g);
        }
        .admin-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--rl);
          padding: 20px;
        }
        .add-form {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid var(--border);
        }
      `}</style>
    </section>
  );
}

function AddClassForm({ onAdd }: { onAdd: (name: string) => void }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    onAdd(name);
    setName("");
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="inline-form">
      <input
        type="text"
        placeholder="New class name (e.g., P1-A)"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button className="btn btn-primary" type="submit" disabled={saving}>
        {saving ? "Adding..." : "Add Class"}
      </button>
    </form>
  );
}

function AddTeacherForm({ onAdd }: { onAdd: (name: string, email: string, role: string) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("teacher");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    onAdd(name, email, role);
    setName("");
    setEmail("");
    setRole("teacher");
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="inline-form">
      <input type="text" placeholder="Teacher name" value={name} onChange={(e) => setName(e.target.value)} />
      <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="teacher">Teacher</option>
        <option value="admin">Admin</option>
      </select>
      <button className="btn btn-primary" type="submit" disabled={saving}>
        {saving ? "Adding..." : "Add User"}
      </button>
    </form>
  );
}

function AddPupilForm({ classes, onAdd }: { classes: Class[]; onAdd: (name: string, classId: string, house: string, paycode: string) => void }) {
  const [name, setName] = useState("");
  const [classId, setClassId] = useState("");
  const [house, setHouse] = useState("");
  const [paycode, setPaycode] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    onAdd(name, classId, house, paycode);
    setName("");
    setClassId("");
    setHouse("");
    setPaycode("");
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="inline-form">
      <input type="text" placeholder="Pupil name" value={name} onChange={(e) => setName(e.target.value)} />
      <select value={classId} onChange={(e) => setClassId(e.target.value)}>
        <option value="">Select class</option>
        {classes.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <input type="text" placeholder="House" value={house} onChange={(e) => setHouse(e.target.value)} style={{ width: "100px" }} />
      <input type="text" placeholder="Paycode" value={paycode} onChange={(e) => setPaycode(e.target.value)} style={{ width: "100px" }} />
      <button className="btn btn-primary" type="submit" disabled={saving}>
        {saving ? "Adding..." : "Add Pupil"}
      </button>
    </form>
  );
}

function AssignTeacherForm({ teachers, classes, onAssign }: { teachers: Teacher[]; classes: Class[]; onAssign: (teacherId: string, classId: string) => void }) {
  const [teacherId, setTeacherId] = useState("");
  const [classId, setClassId] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherId || !classId) return;
    setSaving(true);
    onAssign(teacherId, classId);
    setTeacherId("");
    setClassId("");
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="inline-form">
      <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)}>
        <option value="">Select teacher</option>
        {teachers.map((t) => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>
      <select value={classId} onChange={(e) => setClassId(e.target.value)}>
        <option value="">Select class</option>
        {classes.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <button className="btn btn-primary" type="submit" disabled={saving}>
        {saving ? "Assigning..." : "Assign Teacher"}
      </button>
    </form>
  );
}