
const $ = id => document.getElementById(id);

const CLASS_OPTIONS = {
  SMP: ["VII-A", "VII-B", "VIII-A", "VIII-B", "IX-A"],
  SMA: ["X-A", "X-B", "XI-A", "XI-B", "XII-A"]
};

const DEMO_STUDENTS = [
  { id: "s1", nis: "SMP001", name: "Ahmad Fauzan", level: "SMP", className: "VII-A" },
  { id: "s2", nis: "SMP002", name: "Aisyah Putri", level: "SMP", className: "VII-A" },
  { id: "s3", nis: "SMP003", name: "Bima Pratama", level: "SMP", className: "VII-A" },
  { id: "s4", nis: "SMP004", name: "Citra Maharani", level: "SMP", className: "VII-A" },
  { id: "s5", nis: "SMP005", name: "Daffa Ramadhan", level: "SMP", className: "VIII-A" },
  { id: "s6", nis: "SMP006", name: "Nabila Zahra", level: "SMP", className: "VIII-A" },
  { id: "s7", nis: "SMP007", name: "Rizky Firmansyah", level: "SMP", className: "IX-A" },
  { id: "s8", nis: "SMA001", name: "Aditya Saputra", level: "SMA", className: "X-A" },
  { id: "s9", nis: "SMA002", name: "Farah Nadhira", level: "SMA", className: "X-A" },
  { id: "s10", nis: "SMA003", name: "Ilham Maulana", level: "SMA", className: "X-A" },
  { id: "s11", nis: "SMA004", name: "Siti Aulia", level: "SMA", className: "XI-A" },
  { id: "s12", nis: "SMA005", name: "Rafi Akbar", level: "SMA", className: "XI-A" },
  { id: "s13", nis: "SMA006", name: "Zahra Amalia", level: "SMA", className: "XII-A" }
];

const STUDENT_KEY = "e_absensi_v2_students";
const ATTENDANCE_KEY = "e_absensi_v2_attendance";

let students = load(STUDENT_KEY, DEMO_STUDENTS);
let attendance = load(ATTENDANCE_KEY, []);
let currentReport = [];

function load(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : structuredClone(fallback);
  } catch {
    return structuredClone(fallback);
  }
}

function saveData() {
  localStorage.setItem(STUDENT_KEY, JSON.stringify(students));
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(attendance));
}

function today() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function currentMonth() {
  return today().slice(0, 7);
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  })[char]);
}

function getStudents(level, className) {
  return students
    .filter(student => student.level === level && student.className === className)
    .sort((a, b) => a.name.localeCompare(b.name, "id"));
}

function fillClassSelect(selectId, level, preferred = "") {
  const select = $(selectId);
  const options = CLASS_OPTIONS[level] || [];
  const previous = preferred || select.value;
  select.innerHTML = options.map(name =>
    `<option value="${name}">${name}</option>`
  ).join("");

  if (options.includes(previous)) select.value = previous;
}

function refreshAllSelects() {
  [
    ["dashClass", "dashLevel"],
    ["attClass", "attLevel"],
    ["reportClass", "reportLevel"],
    ["studentClass", "studentLevel"]
  ].forEach(([classId, levelId]) => {
    fillClassSelect(classId, $(levelId).value);
  });
}

function setMessage(id, text, error = false) {
  const el = $(id);
  el.textContent = text;
  el.classList.toggle("error", error);
}

function attendanceFor(studentId, date) {
  return attendance.find(record =>
    record.studentId === studentId && record.date === date
  );
}

function renderDashboard() {
  const level = $("dashLevel").value;
  const className = $("dashClass").value;
  const date = $("dashDate").value;
  const list = getStudents(level, className);

  const counts = { Hadir: 0, Izin: 0, Sakit: 0, Alpa: 0 };
  list.forEach(student => {
    const record = attendanceFor(student.id, date);
    if (record && counts[record.status] !== undefined) {
      counts[record.status]++;
    }
  });

  $("totalStudents").textContent = list.length;
  $("totalPresent").textContent = counts.Hadir;
  $("totalPermission").textContent = counts.Izin;
  $("totalSick").textContent = counts.Sakit;
  $("totalAbsent").textContent = counts.Alpa;

  $("dashboardTable").innerHTML = list.length
    ? list.map((student, index) => {
        const record = attendanceFor(student.id, date);
        return `<tr>
          <td>${index + 1}</td>
          <td>${escapeHTML(student.nis)}</td>
          <td>${escapeHTML(student.name)}</td>
          <td>${escapeHTML(student.className)}</td>
          <td>${record ? escapeHTML(record.status) : "Belum diisi"}</td>
        </tr>`;
      }).join("")
    : `<tr><td colspan="5">Belum ada siswa di kelas ini.</td></tr>`;
}

function renderAttendance() {
  const list = getStudents($("attLevel").value, $("attClass").value);
  const date = $("attDate").value;

  $("attendanceTable").innerHTML = list.length
    ? list.map((student, index) => {
        const record = attendanceFor(student.id, date);
        const status = record ? record.status : "";
        return `<tr>
          <td>${index + 1}</td>
          <td>${escapeHTML(student.nis)}</td>
          <td>${escapeHTML(student.name)}</td>
          <td>
            <select class="attendance-status" data-id="${escapeHTML(student.id)}">
              <option value="">Pilih status</option>
              ${["Hadir", "Izin", "Sakit", "Alpa"].map(option =>
                `<option value="${option}" ${status === option ? "selected" : ""}>${option}</option>`
              ).join("")}
            </select>
          </td>
        </tr>`;
      }).join("")
    : `<tr><td colspan="4">Belum ada siswa di kelas ini.</td></tr>`;

  setMessage("attendanceMessage", "");
}

function resetStudentForm() {
  $("studentForm").reset();
  $("editId").value = "";
  $("studentLevel").value = "SMA";
  fillClassSelect("studentClass", "SMA", "X-A");
  $("studentFormTitle").textContent = "Tambah Siswa";
  setMessage("studentMessage", "");
}

function renderStudents() {
  const query = $("studentSearch").value.trim().toLowerCase();

  const list = students
    .filter(student =>
      `${student.nis} ${student.name} ${student.level} ${student.className}`
        .toLowerCase().includes(query)
    )
    .sort((a, b) => a.name.localeCompare(b.name, "id"));

  $("studentsTable").innerHTML = list.length
    ? list.map((student, index) => `<tr>
        <td>${index + 1}</td>
        <td>${escapeHTML(student.nis)}</td>
        <td>${escapeHTML(student.name)}</td>
        <td>${escapeHTML(student.level)}</td>
        <td>${escapeHTML(student.className)}</td>
        <td><div class="row-actions">
          <button class="btn" data-edit="${escapeHTML(student.id)}">Edit</button>
          <button class="btn danger" data-delete="${escapeHTML(student.id)}">Hapus</button>
        </div></td>
      </tr>`).join("")
    : `<tr><td colspan="6">Data siswa tidak ditemukan.</td></tr>`;
}

function renderReport() {
  const level = $("reportLevel").value;
  const className = $("reportClass").value;
  const month = $("reportMonth").value;
  const list = getStudents(level, className);

  currentReport = list.map(student => {
    const records = attendance.filter(record =>
      record.studentId === student.id && record.date.startsWith(month)
    );

    return {
      nis: student.nis,
      name: student.name,
      Hadir: records.filter(r => r.status === "Hadir").length,
      Izin: records.filter(r => r.status === "Izin").length,
      Sakit: records.filter(r => r.status === "Sakit").length,
      Alpa: records.filter(r => r.status === "Alpa").length,
      Total: records.length
    };
  });

  $("reportTable").innerHTML = currentReport.length
    ? currentReport.map((record, index) => `<tr>
        <td>${index + 1}</td>
        <td>${escapeHTML(record.nis)}</td>
        <td>${escapeHTML(record.name)}</td>
        <td>${record.Hadir}</td>
        <td>${record.Izin}</td>
        <td>${record.Sakit}</td>
        <td>${record.Alpa}</td>
        <td>${record.Total}</td>
      </tr>`).join("")
    : `<tr><td colspan="8">Tidak ada siswa di kelas ini.</td></tr>`;

  setMessage("reportMessage",
    currentReport.some(record => record.Total > 0)
      ? "Rekap berhasil dibuat."
      : "Belum ada absensi tersimpan pada bulan ini."
  );
}

function showPage(pageId) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.toggle("active", page.id === pageId);
  });

  document.querySelectorAll(".nav-link").forEach(button => {
    button.classList.toggle("active", button.dataset.page === pageId);
  });

  const titles = {
    dashboard: "Dashboard",
    attendance: "Isi Absensi",
    students: "Data Siswa",
    subjects: "pilihan mata pelajaran",
    reports: "Rekap Absensi"
  };

  $("pageTitle").textContent = titles[pageId] || "E-Absensi";

  if (pageId === "dashboard") renderDashboard();
  if (pageId === "attendance") renderAttendance();
  if (pageId === "students") renderStudents();
  if (pageId === "reports") renderReport();
}

document.querySelectorAll(".nav-link").forEach(button => {
  button.addEventListener("click", () => showPage(button.dataset.page));
});

$("dashLevel").addEventListener("change", () => {
  fillClassSelect("dashClass", $("dashLevel").value);
  renderDashboard();
});
$("dashClass").addEventListener("change", renderDashboard);
$("dashDate").addEventListener("change", renderDashboard);

$("attLevel").addEventListener("change", () => {
  fillClassSelect("attClass", $("attLevel").value);
  renderAttendance();
});
$("attClass").addEventListener("change", renderAttendance);
$("attDate").addEventListener("change", renderAttendance);

$("saveAttendance").addEventListener("click", () => {
  const date = $("attDate").value;
  const selectors = [...document.querySelectorAll(".attendance-status")];

  if (!date) {
    setMessage("attendanceMessage", "Pilih tanggal terlebih dahulu.", true);
    return;
  }

  if (!selectors.length) {
    setMessage("attendanceMessage", "Tidak ada siswa untuk disimpan.", true);
    return;
  }

  if (selectors.some(select => !select.value)) {
    setMessage("attendanceMessage", "Pilih status kehadiran semua siswa terlebih dahulu.", true);
    return;
  }

  selectors.forEach(select => {
    const studentId = select.dataset.id;
    const existing = attendanceFor(studentId, date);

    if (existing) {
      existing.status = select.value;
    } else {
      attendance.push({ studentId, date, status: select.value });
    }
  });

  saveData();
  renderDashboard();
  renderReport();
  setMessage("attendanceMessage", "Absensi berhasil disimpan di browser ini.");
});

$("studentLevel").addEventListener("change", () => {
  fillClassSelect("studentClass", $("studentLevel").value);
});

$("studentForm").addEventListener("submit", event => {
  event.preventDefault();

  const id = $("editId").value;
  const nis = $("studentNis").value.trim();
  const name = $("studentName").value.trim();
  const level = $("studentLevel").value;
  const className = $("studentClass").value;

  const duplicate = students.some(student =>
    student.nis.toLowerCase() === nis.toLowerCase() && student.id !== id
  );

  if (duplicate) {
    setMessage("studentMessage", "NIS sudah digunakan siswa lain.", true);
    return;
  }

  if (id) {
    const student = students.find(item => item.id === id);
    if (student) Object.assign(student, { nis, name, level, className });
    setMessage("studentMessage", "Data siswa berhasil diperbarui.");
  } else {
    students.push({
      id: `student-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      nis, name, level, className
    });
    setMessage("studentMessage", "Siswa baru berhasil ditambahkan.");
  }

  saveData();
  resetStudentForm();
  renderStudents();
  renderDashboard();
  renderAttendance();
  renderReport();
});

$("cancelEdit").addEventListener("click", resetStudentForm);
$("studentSearch").addEventListener("input", renderStudents);

$("studentsTable").addEventListener("click", event => {
  const editButton = event.target.closest("[data-edit]");
  const deleteButton = event.target.closest("[data-delete]");

  if (editButton) {
    const student = students.find(item => item.id === editButton.dataset.edit);
    if (!student) return;

    $("editId").value = student.id;
    $("studentNis").value = student.nis;
    $("studentName").value = student.name;
    $("studentLevel").value = student.level;
    fillClassSelect("studentClass", student.level, student.className);
    $("studentFormTitle").textContent = "Edit Data Siswa";
    $("studentForm").scrollIntoView({ behavior: "smooth" });
  }

  if (deleteButton) {
    const student = students.find(item => item.id === deleteButton.dataset.delete);
    if (!student) return;

    if (!confirm(`Hapus data siswa ${student.name}? Riwayat absensinya juga akan dihapus.`)) return;

    students = students.filter(item => item.id !== student.id);
    attendance = attendance.filter(record => record.studentId !== student.id);

    saveData();
    renderStudents();
    renderDashboard();
    renderAttendance();
    renderReport();
  }
});

$("reportLevel").addEventListener("change", () => {
  fillClassSelect("reportClass", $("reportLevel").value);
  renderReport();
});
$("reportClass").addEventListener("change", renderReport);
$("reportMonth").addEventListener("change", renderReport);
$("showReport").addEventListener("click", renderReport);

$("exportCsv").addEventListener("click", () => {
  if (!currentReport.length) {
    alert("Tidak ada data untuk diunduh.");
    return;
  }

  const headers = ["NIS", "Nama", "Hadir", "Izin", "Sakit", "Alpa", "Total Sesi"];
  const rows = currentReport.map(record => [
    record.nis, record.name, record.Hadir,
    record.Izin, record.Sakit, record.Alpa, record.Total
  ]);

  const csvCell = value => `"${String(value).replace(/"/g, '""')}"`;
  const csv = [headers, ...rows].map(row => row.map(csvCell).join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `rekap-absensi-${$("reportClass").value}-${$("reportMonth").value}.csv`;
  link.click();
  URL.revokeObjectURL(url);
});

$("resetDemo").addEventListener("click", () => {
  if (!confirm("Reset akan menghapus perubahan data siswa dan seluruh absensi lokal. Lanjutkan?")) return;

  students = structuredClone(DEMO_STUDENTS);
  attendance = [];
  saveData();
  resetStudentForm();
  refreshAllSelects();
  renderDashboard();
  renderAttendance();
  renderStudents();
  renderReport();
  alert("Data contoh berhasil dipulihkan.");
});

function initialize() {
  $("dashDate").value = today();
  $("attDate").value = today();
  $("reportMonth").value = currentMonth();

  refreshAllSelects();
  renderDashboard();
  renderAttendance();
  renderStudents();
  renderReport();
}

initialize();

const SUBJECT_KEY = "e_absensi_v2_subject";
const subjectSelect = document.getElementById("subjectSelect");
const saveSubjectButton = document.getElementById("saveSubject");
const subjectMessage = document.getElementById("subjectMessage");

// Pulihkan pilihan terakhir
const savedSubject = localStorage.getItem(SUBJECT_KEY);
if (savedSubject) {
  subjectSelect.value = savedSubject;
}

// Simpan pilihan mata pelajaran
saveSubjectButton.addEventListener("click", () => {
  localStorage.setItem(SUBJECT_KEY, subjectSelect.value);
  subjectMessage.textContent =
    "Mata pelajaran terpilih: " + subjectSelect.value;
});
