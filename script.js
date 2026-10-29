
const studentsByClass = {
  "SMP-VII-A": [
    { id: "smp7a-001", nama: "Ahmad" },
    { id: "smp7a-002", nama: "Fatimah" },
    { id: "smp7a-003", nama: "Muhammad" },
    { id: "smp7a-004", nama: "Aisyah" }
  ],
  "SMP-VIII-A": [
    { id: "smp8a-001", nama: "Abdullah" },
    { id: "smp8a-002", nama: "Khadijah" },
    { id: "smp8a-003", nama: "Hasan" }
  ],
  "SMA-X-A": [
    { id: "smaxa-001", nama: "Ibrahim" },
    { id: "smaxa-002", nama: "Maryam" },
    { id: "smaxa-003", nama: "Yusuf" }
  ],
  "SMA-XI-A": [
    { id: "smaxia-001", nama: "Umar" },
    { id: "smaxia-002", nama: "Aminah" },
    { id: "smaxia-003", nama: "Ali" }
  ]
};

const levelSelect = document.getElementById("levelSelect");
const classSelect = document.getElementById("classSelect");
const dateInput = document.getElementById("attendanceDate");
const studentTable = document.getElementById("studentTable");
const classDescription = document.getElementById("classDescription");
const saveMessage = document.getElementById("saveMessage");

const statusOptions = [
  "Belum diisi",
  "Hadir",
  "Sakit",
  "Izin",
  "Alpa"
];

// Status hanya disimpan sementara di memori halaman.
let attendance = {};

function getLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

dateInput.value = getLocalDate();

function getCurrentStudents() {
  return studentsByClass[classSelect.value] || [];
}

function getRecordKey(studentId) {
  return [
    levelSelect.value,
    classSelect.value,
    dateInput.value,
    studentId
  ].join("__");
}

function getStatus(studentId) {
  return attendance[getRecordKey(studentId)] || "Belum diisi";
}

function updateClassOptions() {
  const level = levelSelect.value;
  const previousClass = classSelect.value;

  classSelect.replaceChildren();

  const availableClasses = Object.keys(studentsByClass)
    .filter(id => id.startsWith(level + "-"));

  availableClasses.forEach(classId => {
    const option = document.createElement("option");
    option.value = classId;
    option.textContent = classId.replace("-", " ").replace("-", " ");
    classSelect.appendChild(option);
  });

  if (availableClasses.includes(previousClass)) {
    classSelect.value = previousClass;
  }

  renderStudents();
}

function renderStudents() {
  studentTable.replaceChildren();

  const students = getCurrentStudents();

  classDescription.textContent =
    `${levelSelect.value} • ${classSelect.options[classSelect.selectedIndex]?.textContent || ""}`;

  students.forEach((student, index) => {
    const row = document.createElement("tr");

    const numberCell = document.createElement("td");
    numberCell.textContent = index + 1;

    const nameCell = document.createElement("td");
    nameCell.textContent = student.nama;

    const statusCell = document.createElement("td");
    const select = document.createElement("select");

    select.className = "status-select";
    select.setAttribute(
      "aria-label",
      `Status kehadiran ${student.nama}`
    );

    statusOptions.forEach(status => {
      const option = document.createElement("option");
      option.value = status;
      option.textContent = status;
      select.appendChild(option);
    });

    select.value = getStatus(student.id);

    select.addEventListener("change", () => {
      attendance[getRecordKey(student.id)] = select.value;
      updateSummary();

      saveMessage.textContent =
        "Ada perubahan pada demo. Tekan Simpan Demo untuk melihat konfirmasi.";
    });

    statusCell.appendChild(select);
    row.append(numberCell, nameCell, statusCell);
    studentTable.appendChild(row);
  });

  updateSummary();
}

function updateSummary() {
  const students = getCurrentStudents();
  const counts = {
    "Hadir": 0,
    "Sakit": 0,
    "Izin": 0,
    "Alpa": 0
  };

  students.forEach(student => {
    const status = getStatus(student.id);

    if (Object.hasOwn(counts, status)) {
      counts[status]++;
    }
  });

  document.getElementById("totalCount").textContent =
    students.length;

  document.getElementById("presentCount").textContent =
    counts.Hadir;

  document.getElementById("sickCount").textContent =
    counts.Sakit;

  document.getElementById("permissionCount").textContent =
    counts.Izin;

  document.getElementById("absentCount").textContent =
    counts.Alpa;
}

function showPage(pageId) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.toggle("active", page.id === pageId);
  });

  document.querySelectorAll(".nav-link").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.page === pageId
    );
  });
}

document.querySelectorAll(".nav-link").forEach(button => {
  button.addEventListener("click", () => {
    showPage(button.dataset.page);
  });
});

document.querySelectorAll("[data-go]").forEach(button => {
  button.addEventListener("click", () => {
    showPage(button.dataset.go);
  });
});

levelSelect.addEventListener("change", updateClassOptions);
classSelect.addEventListener("change", renderStudents);

dateInput.addEventListener("change", () => {
  renderStudents();
  saveMessage.textContent =
    "Tanggal berubah. Periksa status absensi demo.";
});

document.getElementById("resetButton").addEventListener("click", () => {
  const students = getCurrentStudents();

  students.forEach(student => {
    delete attendance[getRecordKey(student.id)];
  });

  renderStudents();
  saveMessage.textContent =
    "Status kelas dan tanggal terpilih telah direset untuk demo.";
});

document.getElementById("saveButton").addEventListener("click", () => {
  const students = getCurrentStudents();
  const incomplete = students.filter(
    student => getStatus(student.id) === "Belum diisi"
  );

  if (incomplete.length > 0) {
    saveMessage.textContent =
      `Masih ada ${incomplete.length} siswa yang belum diisi.`;
    return;
  }

  saveMessage.textContent =
    "Demo lengkap! Belum tersimpan ke database. Data akan hilang saat halaman dimuat ulang.";
});

updateClassOptions();

function showPage(pageId) {
  // Sembunyikan semua halaman
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  // Tampilkan halaman yang dipilih
  const selectedPage = document.getElementById(pageId);

  if (selectedPage) {
    selectedPage.classList.add("active");
  }

  // Tandai menu yang aktif
  document.querySelectorAll(".nav-link").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.page === pageId
    );
  });
}

// Navigasi menu sidebar
document.querySelectorAll(".nav-link").forEach(button => {
  button.addEventListener("click", () => {
    showPage(button.dataset.page);
  });
});

// Tombol untuk kembali ke dashboard
document.querySelectorAll("[data-go]").forEach(button => {
  button.addEventListener("click", () => {
    showPage(button.dataset.go);
  });
});
