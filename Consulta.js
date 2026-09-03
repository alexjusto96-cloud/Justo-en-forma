// --- SIMULACIÓN DE TINYDB (LocalStorage) Y VARIABLES GLOBALES ---
const TinyDB = {
  getValue: (key, defaultValue = "") => localStorage.getItem(key) || defaultValue,
  storeValue: (key, value) => localStorage.setItem(key, value)
};

let globalName = "";

// URLs de Web Services y WebViewers
const SCRIPT_URL_POST = "https://script.google.com/macros/s/AKfycbxMfiseKw7Fh810OIbEPnGrNZa-ZviQ7XYUifrdrk7lxfHdjODFPRzw0QmLehMKnicI/exec";
const URL_GRAFICO = "https://alexjusto96-cloud.github.io/Grafico-2/?nocache=12345";
const URL_TABLA_ENTRENAMIENTO = "https://script.google.com/macros/s/AKfycbwwDr2VQiWfA4BlgfWWauqzy4RQ-NAcFoQXuuyU4nSXPJU0C1V30Ba-GxzR8drJU7nE/exec";
const URL_TABLA_RENDIMIENTO = "https://script.google.com/macros/s/AKfycbxms-4qo1yqX4lK3lw73tMOqBICXn_2LEmvVnmgIkOTFD7LItZm_KOkew0HO6j2BXA/exec";

// --- INICIALIZACIÓN (Consulta.Initialize) ---
document.addEventListener("DOMContentLoaded", () => {
  globalName = TinyDB.getValue("Usuario", "");
  inicializarFecha();
  bindEvents();
});

function inicializarFecha() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  
  // Asigna fecha de hoy al date picker (AAAA-MM-DD)
  document.getElementById("datePicker1").value = `${year}-${month}-${day}`;
}

// --- MANEJO DE EVENTOS ---
function bindEvents() {
  document.getElementById("entrenamiento").addEventListener("change", alSeleccionarEntrenamiento);
  document.getElementById("ejercicio").addEventListener("change", alSeleccionarEjercicio);
  document.getElementById("consultar_entrenamiento").addEventListener("click", ejecutarConsultaEntrenamiento);
  document.getElementById("consultarRendimiento").addEventListener("click", ejecutarConsultaRendimiento);
}

// Bloque: Entrenamiento.AfterPicking
function alSeleccionarEntrenamiento() {
  const entrenamientoVal = document.getElementById("entrenamiento").value;
  const selectEjercicio = document.getElementById("ejercicio");
  const selectModalidad = document.getElementById("modalidad2");

  selectEjercicio.innerHTML = '<option value=""></option>';
  selectModalidad.innerHTML = '<option value=""></option>';

  if (entrenamientoVal === "Fuerza") {
    // Carga lista guardada en TinyDB bajo la clave "Ejercicio"
    const ejerciciosGuardados = JSON.parse(TinyDB.getValue("Ejercicio", "[]"));
    poblarSelect(selectEjercicio, ejerciciosGuardados);
  } else if (entrenamientoVal === "Cardio") {
    poblarSelect(selectEjercicio, ["Carrera", "Ciclismo"]);
  }
}

// Bloque: Ejercicio.AfterPicking
function alSeleccionarEjercicio() {
  const entrenamientoVal = document.getElementById("entrenamiento").value;
  const ejercicioVal = document.getElementById("ejercicio").value;
  const selectModalidad = document.getElementById("modalidad2");

  selectModalidad.innerHTML = '<option value=""></option>';

  if (entrenamientoVal === "Fuerza") {
    poblarSelect(selectModalidad, ["1:1:1:1", "1:1:2:1", "1:1:1:0"]);
  } else if (entrenamientoVal === "Cardio") {
    if (ejercicioVal === "Carrera") {
      const opcionesCarrera = JSON.parse(TinyDB.getValue("Carrera", "[]"));
      poblarSelect(selectModalidad, opcionesCarrera);
    } else if (ejercicioVal === "Ciclismo") {
      const opcionesCiclismo = JSON.parse(TinyDB.getValue("Ciclismo", "[]"));
      poblarSelect(selectModalidad, opcionesCiclismo);
    }
  }
}

// Bloque: Consultar_entrenamiento.Click
function ejecutarConsultaEntrenamiento() {
  enviarPeticionWebPost(() => {
    const iframeGrafico = document.getElementById("grafico");
    const iframeTabla = document.getElementById("tabla");

    iframeTabla.src = URL_TABLA_ENTRENAMIENTO;
    
    // Configuración de alturas (Grafico: 0%, Tabla: 100%)
    iframeGrafico.style.height = "0px";
    iframeTabla.style.height = "500px";
  });
}

// Bloque: Consultar_rendimiento.Click
function ejecutarConsultaRendimiento() {
  const fecha = document.getElementById("datePicker1").value;
  const entrenamiento = document.getElementById("entrenamiento").value;
  const ejercicio = document.getElementById("ejercicio").value;

  // Validación IF
  if (fecha !== "" && entrenamiento !== "" && ejercicio !== "") {
    enviarPeticionWebPost(() => {
      const iframeGrafico = document.getElementById("grafico");
      const iframeTabla = document.getElementById("tabla");

      iframeGrafico.src = URL_GRAFICO;
      
      // Temporizador (Clock2) abre la tabla tras 500ms
      setTimeout(() => {
        iframeTabla.src = URL_TABLA_RENDIMIENTO;
      }, 500);

      // Ajuste de alturas (Grafico: 40%, Tabla: 40%)
      iframeGrafico.style.height = "250px";
      iframeTabla.style.height = "250px";
    });
  } else {
    // ELSE: Notifier1.ShowAlert
    alert("Comprobar campos");
  }
}

// --- PETICIÓN HTTP (Web1.PostText) ---
function enviarPeticionWebPost(onSuccess) {
  const params = new URLSearchParams({
    "name": globalName,
    "date": document.getElementById("datePicker1").value,
    "textbox": document.getElementById("xDays").value,
    "lp1": document.getElementById("entrenamiento").value,
    "lp2": document.getElementById("ejercicio").value,
    "lp3": document.getElementById("modalidad2").value
  });

  fetch(SCRIPT_URL_POST, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params.toString()
  })
  .then(() => {
    if (onSuccess) onSuccess();
  })
  .catch(err => {
    console.error("Error en la solicitud Web1:", err);
    // Ejecuta la carga de visores aun si hay un bloqueo CORS por parte de Apps Script
    if (onSuccess) onSuccess();
  });
}

// --- UTILIDADES ---
function poblarSelect(selectElement, opciones) {
  opciones.forEach(opt => {
    const option = document.createElement("option");
    option.value = opt;
    option.textContent = opt;
    selectElement.appendChild(option);
  });
}
