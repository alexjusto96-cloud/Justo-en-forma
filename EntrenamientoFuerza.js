// --- VARIABLES GLOBAL Y DE ESTADO ---
let dia1 = "";
let dia2 = "";
let dia3 = "";
let ahora = 0;
let calendar = 0;
let fecha = "";
let last = "";
let rm = 0;
let inicio = 0;
let timerInterval = null;

// Simulación de Almacenamiento Local (sustituye a TinyDB)
const TinyDB = {
  getValue: (key, defaultValue = "") => localStorage.getItem(key) || defaultValue,
  storeValue: (key, value) => localStorage.setItem(key, value)
};

const FORM_URL = "https://docs.google.com/forms/d/1SPk8g5W4vLU2WcD8W7re3BDanaktWrd4r6GO_uS-qcI/formResponse";

// --- INICIALIZACIÓN DOM ---
document.addEventListener("DOMContentLoaded", () => {
  renderSeriesInputs();
  bindEvents();
  inicializarValores();
});

function renderSeriesInputs() {
  const container = document.getElementById("seriesContainer");
  container.innerHTML = "";

  for (let i = 1; i <= 6; i++) {
    const row = document.createElement("div");
    row.className = `serie-row ${i > 2 ? "disabled" : ""}`;
    row.id = `serie_row_${i}`;
    row.innerHTML = `
      <h4>Serie ${i} ${i >= 2 ? `<label><input type="checkbox" id="s${i}" ${i > 2 ? 'disabled' : ''}> Habilitar</label>` : ''}</h4>
      Kg: <input type="text" id="kg${i}">
      Intensidad (i): <input type="text" id="i${i}" readonly>
      Reps: <input type="text" id="Rep${i}">
      RIR: <input type="text" id="RIR${i}">
      Rec: <input type="text" id="rec${i}">
      RM: <input type="text" id="rm${i}">
    `;
    container.appendChild(row);
  }
}

function bindEvents() {
  document.getElementById("nuevoEjercicio").addEventListener("click", ejecutarNuevoEjercicio);
  document.getElementById("enviar").addEventListener("click", enviarFormularioGoogle);
  document.getElementById("consultar").addEventListener("click", consultarEntrenamientos);
  document.getElementById("fin").addEventListener("click", finalizarEntrenamiento);

  document.getElementById("slider1").addEventListener("input", (e) => {
    document.getElementById("percentage").value = e.target.value;
  });

  // Evento dinámico para el switch de Serie 3 (s3)
  document.addEventListener("change", (e) => {
    if (e.target.id === "s3") {
      manejadorCambioS3(e.target.checked);
    }
  });
}

function inicializarValores() {
  const name = TinyDB.getValue("Usuario");
  document.getElementById("percentage").value = document.getElementById("slider1").value;
}

// --- LÓGICA DE EVENTOS (Traducción directa de los Bloques) ---

// Bloque: Nuevo_ejercicio.Click
function ejecutarNuevoEjercicio() {
  const now = new Date();
  fecha = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

  document.getElementById("listPicker1").value = "";
  // Cargar lista desde TinyDB
  const ejGuardados = TinyDB.getValue("Ejercicio", "");
  
  document.getElementById("ejercicio").value = "";
  document.getElementById("con").value = "1";
  document.getElementById("pausaCon").value = "1";
  document.getElementById("ecc").value = "2";
  document.getElementById("pausaEcc").value = "1";

  // Estados de habilitación de switches
  setElementEnabled("s2", true);
  setElementEnabled("s3", false);
  setElementEnabled("s4", false);
  setElementEnabled("s5", false);
  setElementEnabled("s6", false);

  // Campos i1-i6 ReadOnly
  for (let i = 1; i <= 6; i++) {
    const field = document.getElementById(`i${i}`);
    if (field) field.readOnly = true;
  }

  document.getElementById("label32").innerText = "";

  // Reset switches
  ["s2", "s3", "s4", "s5", "s6", "vbt"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.checked = false;
  });

  // Limpiar campos de texto de series y temporizador
  const camposTexto = ["kg1", "Rep1", "RIR1", "rec1", "i1", "rm1", "ejercicio", "textBox1"];
  camposTexto.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  document.getElementById("minutos").innerText = "0";
  document.getElementById("segundos").innerText = "00";
  document.getElementById("slider1").value = 50;
  document.getElementById("percentage").value = "50";
  document.getElementById("label12").innerText = "";
}

// Bloque: Enviar.Click (Google Form Query Params)
function enviarFormularioGoogle() {
  const usuario = encodeURIComponent(TinyDB.getValue("Usuario"));
  const fechaEnc = encodeURIComponent(fecha);
  const vbtVal = encodeURIComponent(document.getElementById("vbt").checked ? "TRUE" : "FALSE");
  const ejVal = encodeURIComponent(document.getElementById("ejercicio").value);

  const params = new URLSearchParams({
    "entry.1052562463": usuario,
    "entry.2002526298": fecha,
    "entry.1315747589": document.getElementById("ejercicio").value,
    "entry.9949262": vbtVal,
    "entry.1445063449": document.getElementById("con").value,
    "entry.2132618651": document.getElementById("pausaCon").value,
    "entry.1198689613": document.getElementById("ecc").value,
    "entry.2062861622": document.getElementById("pausaEcc").value,
    "entry.631342381": document.getElementById("kg1").value,
    "entry.1743166598": document.getElementById("i1").value,
    "entry.189884999": document.getElementById("Rep1").value,
    "entry.164706516": document.getElementById("RIR1").value,
    "entry.297841540": document.getElementById("rec1").value,
    "entry.1579682820": getVal("kg2"),
    "entry.1209305030": getVal("i2"),
    "entry.676283789": getVal("Rep2"),
    "entry.1940734848": getVal("RIR2"),
    "entry.1689760695": getVal("rec2"),
    "entry.34824846": getVal("kg3"),
    "entry.528917915": getVal("i3"),
    "entry.788505499": getVal("Rep3"),
    "entry.1498087804": getVal("RIR3"),
    "entry.1917477661": getVal("rec3"),
    "entry.910847423": getVal("kg4"),
    "entry.831909719": getVal("i4"),
    "entry.1951974537": getVal("Rep4"),
    "entry.424157927": getVal("RIR4"),
    "entry.1976325897": getVal("rec4"),
    "entry.2004267982": getVal("kg5"),
    "entry.207883616": getVal("i5"),
    "entry.1594603315": getVal("Rep5"),
    "entry.1303875824": getVal("RIR5"),
    "entry.1101581192": getVal("rec5"),
    "entry.1166189654": getVal("kg6"),
    "entry.1135214150": getVal("i6"),
    "entry.1557441991": getVal("Rep6"),
    "entry.301613450": getVal("RIR6"),
    "entry.490439673": getVal("rec6"),
    "entry.636191433": getVal("textBox1"),
    "entry.1607583138": getVal("rm1"),
    "entry.337634217": getVal("rm2"),
    "entry.975920808": getVal("rm3"),
    "entry.810637765": getVal("rm4"),
    "entry.30846413": getVal("rm5"),
    "entry.408397467": getVal("rm6")
  });

  // Envío mediante petición GET sin CORS (comportamiento idéntico al Web component)
  fetch(`${FORM_URL}?${params.toString()}`, { mode: 'no-cors' })
    .then(() => console.log("Enviado correctamente"))
    .catch(err => console.error("Error al enviar:", err));
}

// Bloque: Consultar_entrenamientos.Click
function consultarEntrenamientos() {
  const scriptUrl = TinyDB.getValue("script");
  const usuario = encodeURIComponent(TinyDB.getValue("Usuario"));
  const dateEnc = encodeURIComponent(fecha);
  const ejEnc = encodeURIComponent(document.getElementById("ejercicio").value);

  const payload = `tipo=entrenamientoFuerza&usuario=${usuario}&date=${dateEnc}&listpicker=${ejEnc}`;

  fetch(scriptUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: payload
  })
  .then(response => response.text())
  .then(data => {
    calendar = 0;
    // Se deshabilita el botón equivalente a Post
  });
}

// Bloque: Fin.Click
function finalizarEntrenamiento() {
  last = "Fuerza";
  TinyDB.storeValue("Last", last);
  // Redirección equivalente a openAnotherScreen("RPE")
  window.location.href = "RPE.html";
}

// Bloque: s3.Changed
function manejadorCambioS3(isOn) {
  const camposS3 = ["kg3", "i3", "Rep3", "RIR3", "rec3", "rm3"];
  camposS3.forEach(id => setVal(id, ""));

  const rowS4 = document.getElementById("serie_row_4");

  if (isOn) {
    setVal("kg3", getVal("kg2"));
    setElementEnabled("s4", true);
    camposS3.forEach(id => setElementEnabled(id, true));
    if (rowS4) rowS4.classList.remove("disabled");

    // Iniciar cronómetro de descanso (Clock2.Timer logic)
    inicio = Date.now();
    iniciarCronometro();
  } else {
    setElementEnabled("s4", false);
    const switchS4 = document.getElementById("s4");
    if (switchS4) switchS4.checked = false;
    camposS3.forEach(id => setElementEnabled(id, false));
    if (rowS4) rowS4.classList.add("disabled");
  }
}

// Temporizador equivalente a Clock2.Timer
function iniciarCronometro() {
  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    ahora = Date.now();
    const trans = ahora - inicio;
    const mins = Math.floor(trans / 60000);
    const segs = Math.floor((trans % 60000) / 1000);

    document.getElementById("minutos").innerText = mins;
    document.getElementById("segundos").innerText = segs < 10 ? `0${segs}` : segs;
  }, 1000);
}

// --- UTILIDADES ---
function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value : "";
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}

function setElementEnabled(id, enabled) {
  const el = document.getElementById(id);
  if (el) el.disabled = !enabled;
}
