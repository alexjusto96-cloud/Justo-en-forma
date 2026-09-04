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

// --- INICIALIZACIÓN ---
document.addEventListener("DOMContentLoaded", () => {
  globalName = TinyDB.getValue("Usuario", "");
  inicializarFecha();
  bindEvents();
  
  // Limpiar selección inicial por defecto sin opción vacía y forzar estado
  document.getElementById("entrenamiento").selectedIndex = -1;
  actualizarEstadoSelects();
});

function inicializarFecha() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  
  document.getElementById("datePicker1").value = `${year}-${month}-${day}`;
}

// --- MANEJO DE EVENTOS ---
function bindEvents() {
  document.getElementById("entrenamiento").addEventListener("change", alSeleccionarEntrenamiento);
  document.getElementById("ejercicio").addEventListener("change", alSeleccionarEjercicio);
  document.getElementById("consultarEntrenamiento").addEventListener("click", ejecutarConsultaEntrenamiento);
  document.getElementById("consultarRendimiento").addEventListener("click", ejecutarConsultaRendimiento);
}

function actualizarEstadoSelects() {
  const entrenamientoVal = document.getElementById("entrenamiento").value;
  const ejercicioVal = document.getElementById("ejercicio").value;

  const selectEjercicio = document.getElementById("ejercicio");
  const selectModalidad = document.getElementById("modalidad2");

  selectEjercicio.disabled = entrenamientoVal === "";
  selectModalidad.disabled = ejercicioVal === "" || selectEjercicio.disabled;
}

// Bloque: Entrenamiento.AfterPicking
function alSeleccionarEntrenamiento() {
  const entrenamientoVal = document.getElementById("entrenamiento").value;
  const selectEjercicio = document.getElementById("ejercicio");
  const selectModalidad = document.getElementById("modalidad2");

  selectEjercicio.innerHTML = "";
  selectModalidad.innerHTML = "";

  if (entrenamientoVal === "Fuerza") {
    const ejerciciosGuardados = JSON.parse(TinyDB.getValue("Ejercicio", "[]"));
    poblarSelect(selectEjercicio, ejerciciosGuardados);
  } else if (entrenamientoVal === "Cardio") {
    poblarSelect(selectEjercicio, ["Carrera", "Ciclismo"]);
  }

  // Dejar deseleccionados los inferiores al cambiar el superior
  selectEjercicio.selectedIndex = -1;
  selectModalidad.selectedIndex = -1;

  actualizarEstadoSelects();
}

// Bloque: Ejercicio.AfterPicking
function alSeleccionarEjercicio() {
  const entrenamientoVal = document.getElementById("entrenamiento").value;
  const ejercicioVal = document.getElementById("ejercicio").value;
  const selectModalidad = document.getElementById("modalidad2");

  selectModalidad.innerHTML = "";

  if (entrenamientoVal === "Fuerza") {
    // Modalidades específicas para Fuerza independientemente del ejercicio escogido
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

  // Dejar deseleccionado el inferior al cambiar este nivel
  selectModalidad.selectedIndex = -1;

  actualizarEstadoSelects();
}

// Bloque: Consultar_entrenamiento.Click
function ejecutarConsultaEntrenamiento() {
  enviarPeticionWebPost(() => {
    const iframeGrafico = document.getElementById("grafico");
    const iframeTabla = document.getElementById("tabla");

    iframeTabla.src = URL_TABLA_ENTRENAMIENTO;
    
    iframeGrafico.style.height = "0px";
    iframeTabla.style.height = "500px";
  });
}

// Bloque: Consultar_rendimiento.Click
function ejecutarConsultaRendimiento() {
  const fecha = document.getElementById("datePicker1").value;
  const entrenamiento = document.getElementById("entrenamiento").value;
  const ejercicio = document.getElementById("ejercicio").value;

  if (fecha !== "" && entrenamiento !== "" && ejercicio !== "") {
    enviarPeticionWebPost(() => {
      const iframeGrafico = document.getElementById("grafico");
      const iframeTabla = document.getElementById("tabla");

      iframeGrafico.src = URL_GRAFICO;
      
      setTimeout(() => {
        iframeTabla.src = URL_TABLA_RENDIMIENTO;
      }, 500);

      iframeGrafico.style.height = "250px";
      iframeTabla.style.height = "250px";
    });
  } else {
    alert("Comprobar campos");
  }
}

// --- PETICIÓN HTTP ---
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
