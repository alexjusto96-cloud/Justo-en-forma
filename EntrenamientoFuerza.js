// --- VARIABLES GLOBALES Y DE ESTADO ---
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
let currentTextIndex = 0;
const textosNavegacion = ["Texto informativo 1", "Texto informativo 2", "Texto informativo 3"];

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
  actualizarTextoNavegacion();
});

function renderSeriesInputs() {
  const container = document.getElementById("seriesContainer");
  if (!container) return;
  container.innerHTML = "";

  for (let i = 1; i <= 7; i++) {
    const row = document.createElement("div");
    const isActiveOrNext = (i === 1 || i === 2);
    row.className = `serie-row ${!isActiveOrNext ? "disabled" : ""}`;
    row.id = `serie_row_${i}`;
    
    row.innerHTML = `
      <div class="grid-8col">
        <div><input type="checkbox" id="s${i}" ${i === 1 ? 'checked' : ''} ${i > 2 ? 'disabled' : ''}></div>
        <div style="text-align:center; font-weight:bold;">${i}</div>
        <div><input type="text" id="kg${i}" placeholder="Kg"></div>
        <div><input type="text" id="i${i}" placeholder="Int" readonly></div>
        <div><input type="text" id="Rep${i}" placeholder="Reps"></div>
        <div><input type="text" id="RIR${i}" placeholder="RIR"></div>
        <div><input type="text" id="rec${i}" placeholder="R´"></div>
        <div><input type="text" id="rm${i}" placeholder="RM"></div>
      </div>
    `;
    container.appendChild(row);
  }
  actualizarEstadosFilas();
}

function bindEvents() {
  document.getElementById("nuevoEjercicio").addEventListener("click", ejecutarNuevoEjercicio);
  document.getElementById("enviar").addEventListener("click", enviarFormularioGoogle);
  document.getElementById("consultar").addEventListener("click", consultarEntrenamientos);
  document.getElementById("fin").addEventListener("click", finalizarEntrenamiento);

  document.getElementById("slider1").addEventListener("input", (e) => {
    const val = e.target.value;
    document.getElementById("percentage").value = val + "%";
    calcularRMAslider(val);
  });

  document.getElementById("btnTextPrev").addEventListener("click", () => {
    currentTextIndex = (currentTextIndex - 1 + textosNavegacion.length) % textosNavegacion.length;
    actualizarTextoNavegacion();
  });

  document.getElementById("btnTextNext").addEventListener("click", () => {
    currentTextIndex = (currentTextIndex + 1) % textosNavegacion.length;
    actualizarTextoNavegacion();
  });

  document.getElementById("listPicker1").addEventListener("change", (e) => {
    document.getElementById("ejercicio").value = e.target.value;
  });

  // --- BUSCADOR PARA EL LISTPICKER ---
  const buscadorInput = document.getElementById("buscadorEjercicio");
  if (buscadorInput) {
    buscadorInput.addEventListener("input", (e) => {
      const filtro = e.target.value.toLowerCase();
      const picker = document.getElementById("listPicker1");
      if (!picker) return;

      const opciones = picker.options;
      for (let i = 0; i < opciones.length; i++) {
        const textoOption = opciones[i].textContent.toLowerCase();
        if (i === 0) {
          continue; 
        }
        if (textoOption.includes(filtro)) {
          opciones[i].style.display = "";
        } else {
          opciones[i].style.display = "none";
        }
      }
    });
  }

  document.addEventListener("change", (e) => {
    const targetId = e.target.id;
    if (targetId && targetId.match(/^s[1-7]$/)) {
      const numSerie = parseInt(targetId.replace("s", ""), 10);
      manejadorCambioSerie(numSerie, e.target.checked);
    }
  });

  // Escuchar cambios en los inputs de RM para actualizar el valor máximo de referencia
  for (let i = 1; i <= 7; i++) {
    const rmInput = document.getElementById(`rm${i}`);
    if (rmInput) {
      rmInput.addEventListener("input", actualizarMaximoRM);
    }
  }
}

function actualizarTextoNavegacion() {
  document.getElementById("navTextDisplay").innerText = `${textosNavegacion[currentTextIndex]} (${currentTextIndex + 1}/3)`;
}

function calcularRMAslider(porcentaje) {
  const rmVal = parseFloat(document.getElementById("rmRef").value) || 0;
  const resultado = (rmVal * (porcentaje / 100)).toFixed(1);
  document.getElementById("rmResultKg").value = resultado;
}

function actualizarMaximoRM() {
  let maxRM = 0;
  for (let i = 1; i <= 7; i++) {
    const val = parseFloat(getVal(`rm${i}`)) || 0;
    if (val > maxRM) {
      maxRM = val;
    }
  }
  const rmRefEl = document.getElementById("rmRef");
  if (rmRefEl) {
    rmRefEl.value = maxRM > 0 ? maxRM : "";
  }
  const sliderVal = document.getElementById("slider1").value;
  calcularRMAslider(sliderVal);
}

function inicializarValores() {
  const sliderVal = document.getElementById("slider1").value;
  document.getElementById("percentage").value = sliderVal + "%";
  document.getElementById("rmRef").value = "";
  calcularRMAslider(sliderVal);
  
  const rawEj = TinyDB.getValue("Ejercicio", "");
  const picker = document.getElementById("listPicker1");
  if (picker) {
    picker.innerHTML = '<option value="" disabled selected>Seleccionar ejercicio</option>';
    if (rawEj) {
      let lista = [];
      try {
        lista = JSON.parse(rawEj);
      } catch (e) {
        lista = rawEj.includes(",") ? rawEj.split(",") : rawEj.split("\n");
      }
      
      lista.forEach(ej => {
        const valTrim = typeof ej === 'string' ? ej.trim() : ej;
        if (valTrim) {
          const opt = document.createElement("option");
          opt.value = valTrim;
          opt.textContent = valTrim;
          picker.appendChild(opt);
        }
      });
    }
  }
}

// --- LÓGICA DE EVENTOS ---

function ejecutarNuevoEjercicio() {
  const now = new Date();
  fecha = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

  const picker = document.getElementById("listPicker1");
  if (picker) picker.value = "";
  document.getElementById("ejercicio").value = "";
  
  document.getElementById("con").value = "1";
  document.getElementById("pausaCon").value = "1";
  document.getElementById("ecc").value = "2";
  document.getElementById("pausaEcc").value = "1";

  for (let i = 1; i <= 7; i++) {
    const el = document.getElementById(`s${i}`);
    if (el) el.checked = (i === 1);
  }

  actualizarEstadosFilas();

  for (let i = 1; i <= 7; i++) {
    const field = document.getElementById(`i${i}`);
    if (field) field.readOnly = true;
  }

  document.getElementById("label32").innerText = "";
  const vbtEl = document.getElementById("vbt");
  if (vbtEl) vbtEl.checked = false;

  for (let i = 1; i <= 7; i++) {
    ["kg", "Rep", "RIR", "rec", "i", "rm"].forEach(prefix => {
      setVal(`${prefix}${i}`, "");
    });
  }
  setVal("textBox1", "");

  if (timerInterval) clearInterval(timerInterval);
  document.getElementById("minutos").innerText = "0";
  document.getElementById("segundos").innerText = "00";
  
  document.getElementById("slider1").value = 50;
  document.getElementById("percentage").value = "50%";
  document.getElementById("rmRef").value = "";
  calcularRMAslider(50);
  document.getElementById("label12").innerText = "";
}

function enviarFormularioGoogle() {
  const usuario = encodeURIComponent(TinyDB.getValue("Usuario"));
  const vbtVal = encodeURIComponent(document.getElementById("vbt").checked ? "TRUE" : "FALSE");
  
  const params = new URLSearchParams({
    "entry.1052562463": usuario,
    "entry.2002526298": fecha,
    "entry.1315747589": document.getElementById("ejercicio").value,
    "entry.9949262": vbtVal,
    "entry.1445063449": document.getElementById("con").value,
    "entry.2132618651": document.getElementById("pausaCon").value,
    "entry.1198689613": document.getElementById("ecc").value,
    "entry.2062861622": document.getElementById("pausaEcc").value,
    "entry.631342381": getVal("kg1"),
    "entry.1743166598": getVal("i1"),
    "entry.189884999": getVal("Rep1"),
    "entry.164706516": getVal("RIR1"),
    "entry.297841540": getVal("rec1"),
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

  fetch(`${FORM_URL}?${params.toString()}`, { mode: 'no-cors' })
    .then(() => alert("Registro enviado con éxito"))
    .catch(err => console.error("Error al enviar:", err));
}

function consultarEntrenamientos() {
  const scriptUrl = TinyDB.getValue("script");
  const usuario = encodeURIComponent(TinyDB.getValue("Usuario"));
  const dateEnc = encodeURIComponent(fecha);
  const ejEnc = encodeURIComponent(document.getElementById("ejercicio").value);

  const payload = `tipo=entrenamientoFuerza&usuario=${usuario}&date=${dateEnc}&listpicker=${ejEnc}`;

  if (!scriptUrl) {
    console.warn("URL de Apps Script no configurada en TinyDB");
    return;
  }

  fetch(scriptUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: payload
  })
  .then(response => response.text())
  .then(data => {
    calendar = 0;
    console.log("Consulta realizada:", data);
  })
  .catch(err => console.error("Error al consultar:", err));
}

function finalizarEntrenamiento() {
  last = "Fuerza";
  TinyDB.storeValue("Last", last);
  window.location.href = "RPE.html";
}

function actualizarEstadosFilas() {
  // Encontrar el último índice de serie que tiene el switch encendido (ON)
  let ultimoIndexOn = 0;
  for (let i = 1; i <= 7; i++) {
    const chk = document.getElementById(`s${i}`);
    if (chk && chk.checked) {
      ultimoIndexOn = i;
    }
  }

  // Si no hay ninguna encendida, por seguridad permitimos la 1
  if (ultimoIndexOn === 0) ultimoIndexOn = 1;

  for (let i = 1; i <= 7; i++) {
    const chk = document.getElementById(`s${i}`);
    const row = document.getElementById(`serie_row_${i}`);
    
    // Regla en cascada:
    // Una fila está activa (desbloqueada y con su switch habilitable) si:
    // - Es la primera fila (i === 1)
    // - O si la fila inmediatamente anterior (i - 1) tiene su switch ON.
    const filaAnteriorOn = (i > 1 && document.getElementById(`s${i - 1}`).checked);
    const esActiva = (i === 1 || filaAnteriorOn);

    if (esActiva) {
      if (chk) chk.disabled = false;
      if (row) row.classList.remove("disabled");
    } else {
      if (chk) {
        chk.disabled = true;
        chk.checked = false; // Se apaga en cascada si la anterior se apaga
      }
      if (row) row.classList.add("disabled");
      // Limpiamos los campos de texto de la fila desactivada automáticamente
      ["kg", "i", "Rep", "RIR", "rec", "rm"].forEach(prefix => setVal(`${prefix}${i}`, ""));
    }
  }
}

function manejadorCambioSerie(numSerie, isOn) {
  if (isOn) {
    if (numSerie > 1) {
      const kgAnterior = getVal(`kg${numSerie - 1}`);
      setVal(`kg${numSerie}`, kgAnterior);
    }
    inicio = Date.now();
    iniciarCronometro();
  } else {
    // Si se apaga una fila, limpiamos sus datos y los de todas las filas posteriores en cascada
    for (let i = numSerie; i <= 7; i++) {
      if (i > numSerie) {
        const switchEl = document.getElementById(`s${i}`);
        if (switchEl) switchEl.checked = false;
      }
      ["kg", "i", "Rep", "RIR", "rec", "rm"].forEach(prefix => setVal(`${prefix}${i}`, ""));
    }
    actualizarMaximoRM();
  }
  actualizarEstadosFilas();
}

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
