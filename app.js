// =========================
// 1) Routing (3 widoki)
// =========================
const views = {
  home: document.getElementById("view-home"),
  add: document.getElementById("view-add"),
  about: document.getElementById("view-about"),
};

function showView(name) {
  Object.values(views).forEach((v) => v.classList.add("hidden"));
  (views[name] || views.home).classList.remove("hidden");
}

function router() {
  const hash = location.hash || "#/home";
  const route = hash.replace("#/", "");
  showView(route);
}

window.addEventListener("hashchange", router);
router();

// =========================
// 2) Offline banner (prosto)
// =========================
const offlineBanner = document.getElementById("offlineBanner");

function updateOfflineBanner() {
  if (!offlineBanner) return;
  offlineBanner.classList.toggle("hidden", navigator.onLine);
}

window.addEventListener("online", updateOfflineBanner);
window.addEventListener("offline", updateOfflineBanner);
updateOfflineBanner();

// =========================
// 3) Notatki (localStorage)
// =========================
const KEY = "pwa_notes_v1";
const notesList = document.getElementById("notesList");
const clearBtn = document.getElementById("clearBtn");

function loadNotes() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function saveNotes(arr) {
  localStorage.setItem(KEY, JSON.stringify(arr));
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (s) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[s]));
}

// odporne na stare wpisy / różne nazwy pola
function getPhotoFromNote(n) {
  return (
    n.photoDataUrl ||
    n.photoDataURL ||
    n.photo ||
    n.imageDataUrl ||
    n.image ||
    null
  );
}

function renderNotes() {
  const notes = loadNotes();
  notesList.innerHTML = "";

  if (!notes.length) {
    notesList.innerHTML = `<li class="muted">Brak notatek. Przejdź do „Dodaj”.</li>`;
    return;
  }

  for (const n of notes) {
    const photo = getPhotoFromNote(n);
    const li = document.createElement("li");
    li.className = "noteCard";

    li.innerHTML = `
      <div class="noteHeader">
        <strong class="noteTitle">${escapeHtml(n.title || "(bez tytułu)")}</strong>
        <div class="noteHeaderRight">
          <span class="noteDate">${new Date(n.createdAt).toLocaleString()}</span>
          <button class="noteDeleteBtn danger" type="button" data-id="${escapeHtml(n.id)}">Usuń</button>
        </div>
      </div>

      ${n.text ? `<div class="noteText">${escapeHtml(n.text)}</div>` : ""}

      <div class="noteMeta">
        <span>${escapeHtml(n.geoText || "—")}</span>
      </div>

      ${photo ? `<img class="noteImg" alt="Zdjęcie" src="${photo}" />` : ""}
    `;

    notesList.appendChild(li);
  }
}

// Usuwanie pojedynczej notatki (delegacja kliknięć)
notesList.addEventListener("click", (e) => {
  const btn = e.target.closest(".noteDeleteBtn");
  if (!btn) return;

  const id = btn.getAttribute("data-id");
  if (!id) return;

  const ok = confirm("Usunąć tę notatkę?");
  if (!ok) return;

  const notes = loadNotes();
  const filtered = notes.filter((n) => String(n.id) !== String(id));
  saveNotes(filtered);
  renderNotes();
});

clearBtn.addEventListener("click", () => {
  localStorage.removeItem(KEY);
  renderNotes();
});

renderNotes();

// =========================
// 4) Widok: Dodaj (Geo + Kamera + zapis)
// =========================
const titleInput = document.getElementById("titleInput");
const textInput = document.getElementById("textInput");
const geoBtn = document.getElementById("geoBtn");
const geoOut = document.getElementById("geoOut");
const camBtn = document.getElementById("camBtn");
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const snapBtn = document.getElementById("snapBtn");
const stopCamBtn = document.getElementById("stopCamBtn");
const photoPreview = document.getElementById("photoPreview");
const saveBtn = document.getElementById("saveBtn");
const saveMsg = document.getElementById("saveMsg");

let currentGeo = null;
let currentGeoText = "—";
let currentStream = null;
let currentPhotoDataUrl = null;

// Geolokalizacja
geoBtn.addEventListener("click", () => {
  saveMsg.textContent = "";

  if (!("geolocation" in navigator)) {
    geoOut.textContent = "Geolokalizacja niedostępna w tej przeglądarce.";
    return;
  }

  geoOut.textContent = "Pobieram…";

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      currentGeo = { lat: latitude, lon: longitude };
      currentGeoText = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      geoOut.textContent = currentGeoText;
    },
    (err) => {
      geoOut.textContent = `Błąd geolokalizacji: ${err.message}`;
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
});

// Kamera
camBtn.addEventListener("click", async () => {
  saveMsg.textContent = "";

  if (!navigator.mediaDevices?.getUserMedia) {
    saveMsg.textContent = "Kamera niedostępna w tej przeglądarce.";
    return;
  }

  try {
    currentStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });

    video.srcObject = currentStream;
    video.classList.remove("hidden");
    snapBtn.classList.remove("hidden");
    stopCamBtn.classList.remove("hidden");
  } catch (e) {
    saveMsg.textContent = `Nie udało się uruchomić kamery: ${e.message}`;
  }
});

snapBtn.addEventListener("click", () => {
  if (!currentStream) return;

  const w = video.videoWidth || 640;
  const h = video.videoHeight || 480;

  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, w, h);

  currentPhotoDataUrl = canvas.toDataURL("image/jpeg", 0.8);
  photoPreview.src = currentPhotoDataUrl;
  photoPreview.classList.remove("hidden");
});

stopCamBtn.addEventListener("click", () => stopCamera());

function stopCamera() {
  if (currentStream) {
    currentStream.getTracks().forEach((t) => t.stop());
    currentStream = null;
  }
  video.classList.add("hidden");
  snapBtn.classList.add("hidden");
  stopCamBtn.classList.add("hidden");
}

// Zapis notatki
saveBtn.addEventListener("click", () => {
  const title = titleInput.value.trim();
  const text = textInput.value.trim();

  if (!title && !text) {
    saveMsg.textContent = "Dodaj tytuł lub opis.";
    return;
  }

  const notes = loadNotes();

  notes.unshift({
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    title,
    text,
    createdAt: Date.now(),
    geo: currentGeo,
    geoText: currentGeoText,
    photoDataUrl: currentPhotoDataUrl,
  });

  saveNotes(notes);

  // reset
  titleInput.value = "";
  textInput.value = "";
  currentGeo = null;
  currentGeoText = "—";
  geoOut.textContent = "—";
  currentPhotoDataUrl = null;
  photoPreview.classList.add("hidden");
  photoPreview.src = "";
  stopCamera();

  saveMsg.textContent = "Zapisano ✅";
  renderNotes();
  location.hash = "#/home";
});

// =========================
// 5) Rejestracja Service Workera
// =========================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .catch((err) => console.warn("SW registration failed:", err));
  });
}
