import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const config = window.SUPABASE_CONFIG || {};
const supabase = createClient(config.url, config.anonKey);

const state = {
  session: null,
  profile: null,
  classes: [],
  subjects: [],
  pupils: [],
  marks: [],
  profiles: [],
  teacherClass: null,
  realtimeChannel: null
};

const authScreen = document.getElementById("authScreen");
const appShell = document.getElementById("appShell");
const authMessage = document.getElementById("authMessage");
const eventFeed = document.getElementById("eventFeed");

const els = {
  loginForm: document.getElementById("loginForm"),
  emailInput: document.getElementById("emailInput"),
  passwordInput: document.getElementById("passwordInput"),
  logoutButton: document.getElementById("logoutButton"),
  refreshButton: document.getElementById("refreshButton"),
  screenTitle: document.getElementById("screenTitle"),
  screenSubtitle: document.getElementById("screenSubtitle"),
  identityBadge: document.getElementById("identityBadge"),
  identityName: document.getElementById("identityName"),
  identityMeta: document.getElementById("identityMeta"),
  metricsGrid: document.getElementById("metricsGrid"),
  teacherView: document.getElementById("teacherView"),
  adminView: document.getElementById("adminView"),
  teacherTableWrap: document.getElementById("teacherTableWrap"),
  teacherProgress: document.getElementById("teacherProgress"),
  classPerformance: document.getElementById("classPerformance"),
  adminPupilTable: document.getElementById("adminPupilTable"),
  newPupilForm: document.getElementById("newPupilForm"),
  newPupilInput: document.getElementById("newPupilInput"),
  storageForm: document.getElementById("storageForm"),
  storageInput: document.getElementById("storageInput"),
  storageMessage: document.getElementById("storageMessage"),
  edgeButton: document.getElementById("edgeButton"),
  edgeResult: document.getElementById("edgeResult")
};

const markDrafts = new Map();

function averageFor(pupilId) {
  const subjectIds = state.subjects.map((subject) => subject.id);
  if (!subjectIds.length) return 0;

  const total = subjectIds.reduce((sum, subjectId) => {
    const key = `${pupilId}::${subjectId}`;
    const existing =
      markDrafts.has(key) ? markDrafts.get(key) : getPersistedMark(pupilId, subjectId);
    return sum + (Number(existing) || 0);
  }, 0);

  return total / subjectIds.length;
}

function positionFor(pupilId) {
  const ranked = [...state.pupils]
    .map((pupil) => ({ ...pupil, avg: averageFor(pupil.id) }))
    .sort((a, b) => b.avg - a.avg);
  return ranked.findIndex((pupil) => pupil.id === pupilId) + 1;
}

function getPersistedMark(pupilId, subjectId) {
  return (
    state.marks.find(
      (mark) => mark.pupil_id === pupilId && mark.subject_id === subjectId
    )?.score ?? ""
  );
}

function gradeFromAverage(score) {
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  return "F";
}

function setMessage(node, message, isError = false) {
  node.textContent = message;
  node.className = `message${isError ? " error-text" : ""}`;
}

function pushEvent(message) {
  const item = document.createElement("li");
  item.textContent = `${new Date().toLocaleTimeString()}  ${message}`;
  eventFeed.prepend(item);
  while (eventFeed.children.length > 8) {
    eventFeed.removeChild(eventFeed.lastChild);
  }
}

function renderMetrics() {
  const metrics = [
    {
      label: "Classes",
      value: state.classes.length
    },
    {
      label: "Pupils",
      value: state.pupils.length
    },
    {
      label: "Subjects",
      value: state.subjects.length
    },
    {
      label: "Marks",
      value: state.marks.length
    }
  ];

  els.metricsGrid.innerHTML = metrics
    .map(
      (metric) => `
        <article class="metric-card">
          <div class="metric-label">${metric.label}</div>
          <div class="metric-value">${metric.value}</div>
        </article>
      `
    )
    .join("");
}

function renderTeacherTable() {
  const header = [
    "<th class='sticky-col'>Pupil</th>",
    ...state.subjects.map((subject) => `<th>${subject.name}</th>`),
    "<th>Average</th>",
    "<th>Grade</th>",
    "<th>Position</th>"
  ].join("");

  const rows = state.pupils
    .map((pupil) => {
      const cells = state.subjects
        .map((subject) => {
          const key = `${pupil.id}::${subject.id}`;
          const value =
            markDrafts.has(key) ? markDrafts.get(key) : getPersistedMark(pupil.id, subject.id);
          return `
            <td>
              <input
                class="score-input"
                type="number"
                min="0"
                max="100"
                value="${value}"
                data-pupil="${pupil.id}"
                data-subject="${subject.id}"
              />
            </td>
          `;
        })
        .join("");

      const average = averageFor(pupil.id);
      return `
        <tr>
          <td class="sticky-col">${pupil.name}</td>
          ${cells}
          <td class="summary-cell">${average.toFixed(1)}</td>
          <td class="summary-cell">${gradeFromAverage(average)}</td>
          <td class="summary-cell">${positionFor(pupil.id)}</td>
        </tr>
      `;
    })
    .join("");

  els.teacherTableWrap.innerHTML = `
    <div class="toolbar">
      <button class="btn btn-primary" id="saveMarksButton" type="button">
        Save Marks
      </button>
    </div>
    <div class="table-wrap">
      <table class="marks-table">
        <thead><tr>${header}</tr></thead>
        <tbody>${rows || "<tr><td colspan='99'>No pupils in this class.</td></tr>"}</tbody>
      </table>
    </div>
  `;

  els.teacherTableWrap.querySelectorAll(".score-input").forEach((input) => {
    input.addEventListener("input", (event) => {
      const target = event.currentTarget;
      const key = `${target.dataset.pupil}::${target.dataset.subject}`;
      markDrafts.set(key, target.value);
      renderTeacherTable();
    });
  });

  const saveButton = document.getElementById("saveMarksButton");
  if (saveButton) saveButton.addEventListener("click", saveMarks);
}

function renderAdminView() {
  const teacherRows = state.classes
    .map((schoolClass) => {
      const teacher = state.profiles.find(
        (profile) => profile.class_id === schoolClass.id && profile.role === "teacher"
      );
      const pupilCount = state.pupils.filter((pupil) => pupil.class_id === schoolClass.id).length;
      const markCount = state.marks.filter((mark) =>
        state.pupils.some(
          (pupil) => pupil.class_id === schoolClass.id && pupil.id === mark.pupil_id
        )
      ).length;
      return `
        <div class="list-row">
          <span>${schoolClass.name}</span>
          <span>${teacher?.full_name || "Unassigned"}</span>
          <span>${pupilCount} pupils</span>
          <span>${markCount} marks</span>
        </div>
      `;
    })
    .join("");

  els.teacherProgress.innerHTML = teacherRows || "<p>No classes found.</p>";

  const classPerformance = state.classes
    .map((schoolClass) => {
      const classPupils = state.pupils.filter((pupil) => pupil.class_id === schoolClass.id);
      const classAverage = classPupils.length
        ? classPupils.reduce((sum, pupil) => sum + averageFor(pupil.id), 0) / classPupils.length
        : 0;
      return `
        <div class="list-row">
          <span>${schoolClass.name}</span>
          <span>${classAverage.toFixed(1)}</span>
        </div>
      `;
    })
    .join("");

  els.classPerformance.innerHTML = classPerformance || "<p>No performance data.</p>";

  const pupilRows = state.pupils
    .map((pupil) => {
      const schoolClass = state.classes.find((entry) => entry.id === pupil.class_id);
      const average = averageFor(pupil.id);
      return `
        <tr>
          <td>${pupil.full_name}</td>
          <td>${schoolClass?.name || "-"}</td>
          <td>${average.toFixed(1)}</td>
          <td>${gradeFromAverage(average)}</td>
          <td>${positionFor(pupil.id)}</td>
        </tr>
      `;
    })
    .join("");

  els.adminPupilTable.innerHTML = `
    <table class="marks-table">
      <thead>
        <tr>
          <th>Pupil</th>
          <th>Class</th>
          <th>Average</th>
          <th>Grade</th>
          <th>Position</th>
        </tr>
      </thead>
      <tbody>${pupilRows || "<tr><td colspan='5'>No pupils found.</td></tr>"}</tbody>
    </table>
  `;
}

function renderShell() {
  const isTeacher = state.profile?.role === "teacher";
  const roleLabel = isTeacher ? "Teacher" : "Administrator";
  const badgeText = (state.profile?.full_name || "--")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  els.screenTitle.textContent = isTeacher ? "Teacher Dashboard" : "Admin Dashboard";
  els.screenSubtitle.textContent = isTeacher
    ? `${state.teacherClass?.name || "Unassigned class"}  | Supabase-authenticated teacher session`
    : "School-wide view powered by Supabase";
  els.identityBadge.textContent = badgeText || "--";
  els.identityName.textContent = state.profile?.full_name || state.profile?.email || "--";
  els.identityMeta.textContent = `${roleLabel} | ${state.profile?.email || ""}`;
  renderMetrics();

  if (isTeacher) {
    els.teacherView.classList.remove("hidden");
    els.adminView.classList.add("hidden");
    renderTeacherTable();
  } else {
    els.teacherView.classList.add("hidden");
    els.adminView.classList.remove("hidden");
    renderAdminView();
  }
}

async function fetchProfile() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, class_id")
    .eq("id", state.session.user.id)
    .single();

  if (error) throw error;
  state.profile = data;
}

async function loadTeacherData() {
  const [{ data: classData }, { data: subjects }, { data: pupils }] = await Promise.all([
    supabase.from("classes").select("id, name").eq("id", state.profile.class_id).single(),
    supabase
      .from("subjects")
      .select("id, name, level")
      .in("level", ["core", "primary", "nursery"])
      .order("name"),
    supabase
      .from("pupils")
      .select("id, full_name, class_id")
      .eq("class_id", state.profile.class_id)
      .order("full_name")
  ]);

  state.teacherClass = classData || null;
  state.subjects = subjects || [];
  state.pupils = pupils || [];

  const pupilIds = state.pupils.map((pupil) => pupil.id);
  if (!pupilIds.length) {
    state.marks = [];
    return;
  }

  const { data: marks } = await supabase
    .from("marks")
    .select("id, pupil_id, subject_id, score")
    .in("pupil_id", pupilIds);
  state.marks = marks || [];
}

async function loadAdminData() {
  const [{ data: classes }, { data: profiles }, { data: pupils }, { data: subjects }, { data: marks }] =
    await Promise.all([
      supabase.from("classes").select("id, name").order("name"),
      supabase.from("profiles").select("id, email, full_name, role, class_id"),
      supabase.from("pupils").select("id, full_name, class_id").order("full_name"),
      supabase.from("subjects").select("id, name, level").order("name"),
      supabase.from("marks").select("id, pupil_id, subject_id, score")
    ]);

  state.classes = classes || [];
  state.profiles = profiles || [];
  state.pupils = pupils || [];
  state.subjects = subjects || [];
  state.marks = marks || [];
}

async function loadAppData() {
  await fetchProfile();
  const { data: classes } = await supabase.from("classes").select("id, name").order("name");
  state.classes = classes || [];

  if (state.profile.role === "teacher") {
    await loadTeacherData();
  } else {
    await loadAdminData();
  }

  renderShell();
}

async function handleLogin(event) {
  event.preventDefault();
  setMessage(authMessage, "Signing in...");

  const email = els.emailInput.value.trim();
  const password = els.passwordInput.value;
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    setMessage(authMessage, error.message, true);
    return;
  }

  setMessage(authMessage, "");
}

async function handleLogout() {
  await supabase.auth.signOut();
}

async function saveMarks() {
  const payload = [...markDrafts.entries()].map(([key, score]) => {
    const [pupil_id, subject_id] = key.split("::");
    return {
      pupil_id,
      subject_id,
      score: Number(score)
    };
  });

  if (!payload.length) {
    pushEvent("No mark changes to save.");
    return;
  }

  const { error } = await supabase.from("marks").upsert(payload, {
    onConflict: "pupil_id,subject_id"
  });

  if (error) {
    pushEvent(`Save failed: ${error.message}`);
    return;
  }

  markDrafts.clear();
  pushEvent("Marks saved to Supabase.");
  await loadTeacherData();
  renderShell();
}

async function addPupil(event) {
  event.preventDefault();
  const full_name = els.newPupilInput.value.trim();
  if (!full_name || !state.profile?.class_id) return;

  const { error } = await supabase.from("pupils").insert({
    full_name,
    class_id: state.profile.class_id
  });

  if (error) {
    pushEvent(`Pupil insert failed: ${error.message}`);
    return;
  }

  els.newPupilInput.value = "";
  pushEvent(`Pupil added: ${full_name}`);
  await loadTeacherData();
  renderShell();
}

async function uploadAsset(event) {
  event.preventDefault();
  const file = els.storageInput.files[0];
  if (!file) {
    setMessage(els.storageMessage, "Pick a file first.", true);
    return;
  }

  const path = `${state.profile.id}/${Date.now()}-${file.name}`;
  const { error } = await supabase.storage
    .from(config.storageBucket)
    .upload(path, file, { upsert: true });

  if (error) {
    setMessage(els.storageMessage, error.message, true);
    return;
  }

  setMessage(els.storageMessage, `Uploaded to ${config.storageBucket}/${path}`);
  pushEvent(`Storage upload completed: ${file.name}`);
}

async function invokeEdgeFunction() {
  const { data, error } = await supabase.functions.invoke(config.edgeFunction, {
    body: {
      role: state.profile.role,
      classId: state.profile.class_id || null
    }
  });

  els.edgeResult.textContent = JSON.stringify(error || data, null, 2);
}

function clearRealtime() {
  if (state.realtimeChannel) {
    supabase.removeChannel(state.realtimeChannel);
    state.realtimeChannel = null;
  }
}

function setupRealtime() {
  clearRealtime();

  state.realtimeChannel = supabase
    .channel("school-live")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "marks" },
      async (payload) => {
        pushEvent(`Realtime marks event: ${payload.eventType}`);
        if (state.profile?.role === "teacher") {
          await loadTeacherData();
        } else {
          await loadAdminData();
        }
        renderShell();
      }
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "pupils" },
      async (payload) => {
        pushEvent(`Realtime pupils event: ${payload.eventType}`);
        if (state.profile?.role === "teacher") {
          await loadTeacherData();
        } else {
          await loadAdminData();
        }
        renderShell();
      }
    )
    .subscribe();
}

async function applySession(session) {
  state.session = session;

  if (!session) {
    clearRealtime();
    authScreen.classList.remove("hidden");
    appShell.classList.add("hidden");
    return;
  }

  authScreen.classList.add("hidden");
  appShell.classList.remove("hidden");
  await loadAppData();
  setupRealtime();
}

els.loginForm.addEventListener("submit", handleLogin);
els.logoutButton.addEventListener("click", handleLogout);
els.refreshButton.addEventListener("click", loadAppData);
els.newPupilForm.addEventListener("submit", addPupil);
els.storageForm.addEventListener("submit", uploadAsset);
els.edgeButton.addEventListener("click", invokeEdgeFunction);

const { data: initialSession } = await supabase.auth.getSession();
await applySession(initialSession.session);

supabase.auth.onAuthStateChange(async (_event, session) => {
  await applySession(session);
});
