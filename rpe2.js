// Configuración Global
const scriptRPE = "https://script.google.com/macros/s/.../exec";

// Datos simulados de LocalStorage (equivalente a TinyBD1)
const localStorageData = {
  nombre: "Atleta Demo",
  fecha: new Date().toISOString().split('T')[0],
  estatus: "Activo",
  duración: "60",
  rpe: "7",
  entrenamiento: "Cardio", // Opciones: "Fuerza", "Cardio", "Otro"
  Carrera: ["Rodaje", "Series", "Fartlek", "Cuesta"],
  Ciclismo: ["Z2", "SweetSpot", "Vo2Max", "Recuperación"]
};

// Función auxiliar para simular TinyBD1.GetValue
function getTinyBD(key) {
  return localStorageData[key] || "";
}

// Elementos del DOM
const grpModalidad = document.getElementById('grp-modalidad');
const grpTipo = document.getElementById('grp-tipo');
const grpKilometraje = document.getElementById('grp-kilometraje');
const grpPulso = document.getElementById('grp-pulso');
const grpIntensidad = document.getElementById('grp-intensidad');

const selectModalidad = document.getElementById('modalidad');
const selectTipo = document.getElementById('tipo');
const lblTipo = document.getElementById('lbl-tipo');
const inputKilometraje = document.getElementById('kilometraje');
const lblKilometraje = document.getElementById('lbl-kilometraje');
const lblInten = document.getElementById('lbl-inten');
const inputMin = document.getElementById('min');
const inputSeg = document.getElementById('seg');
const delimiterSeg = document.getElementById('delimiter-seg');
const inputPulso = document.getElementById('pulso');
const textareaComentarios = document.getElementById('comentarios');
const form = document.getElementById('rpeForm');
const statusMessage = document.getElementById('statusMessage');

// 1. Inicialización según el tipo de entrenamiento (Equivalente a RPE2.Initialize)
function initializeScreen() {
  const entrenamiento = getTinyBD("entrenamiento");

  if (entrenamiento === "Fuerza") {
    grpModalidad.classList.add('hidden');
    grpKilometraje.classList.add('hidden');
    grpPulso.classList.add('hidden');
    grpIntensidad.classList.add('hidden');

    // Opciones del selector de bloques ["A", "B"]
    selectTipo.innerHTML = `
      <option value="">-- Seleccionar Bloque --</option>
      <option value="A">Bloque A</option>
      <option value="B">Bloque B</option>
    `;
    grpTipo.classList.remove('hidden');

  } else if (entrenamiento === "Otro") {
    grpModalidad.classList.add('hidden');
    grpTipo.classList.add('hidden');
    grpPulso.classList.add('hidden');
    grpIntensidad.classList.add('hidden');

    // Campo libre de kilometraje/notas
    lblKilometraje.textContent = "Notas / Distancia";
    inputKilometraje.type = "text";
    grpKilometraje.classList.remove('hidden');

  } else if (entrenamiento === "Cardio") {
    grpModalidad.classList.remove('hidden');
    grpKilometraje.classList.remove('hidden');
    grpPulso.classList.remove('hidden');
    grpIntensidad.classList.remove('hidden');
  }
}

// 2. Lógica al cambiar modalidad (Equivalente a modalidad.AfterPicking)
selectModalidad.addEventListener('change', function() {
  const modalidad = selectModalidad.value;
  selectTipo.innerHTML = '<option value="">-- Seleccionar --</option>';

  if (modalidad === "Carrera") {
    lblInten.textContent = "Intensidad PP (Ritmo)";
    inputSeg.classList.remove('hidden');
    delimiterSeg.classList.remove('hidden');

    // Cargar opciones dinámicas de Carrera desde almacenamiento
    const opcionesCarrera = getTinyBD("Carrera");
    opcionesCarrera.forEach(opcion => {
      const opt = document.createElement('option');
      opt.value = opcion;
      opt.textContent = opcion;
      selectTipo.appendChild(opt);
    });
    grpTipo.classList.remove('hidden');

  } else if (modalidad === "Ciclismo") {
    lblInten.textContent = "Intensidad PP (Watios)";
    inputSeg.classList.add('hidden');
    delimiterSeg.classList.add('hidden');

    // Cargar opciones dinámicas de Ciclismo desde almacenamiento
    const opcionesCiclismo = getTinyBD("Ciclismo");
    opcionesCiclismo.forEach(opcion => {
      const opt = document.createElement('option');
      opt.value = opcion;
      opt.textContent = opcion;
      selectTipo.appendChild(opt);
    });
    grpTipo.classList.remove('hidden');
  } else {
    grpTipo.classList.add('hidden');
  }
});

// 3. Envío del formulario (Equivalente a Botón1.Click)
form.addEventListener('submit', function(e) {
  e.preventDefault();
  
  let datosFormulario = {};
  const modalidad = selectModalidad.value;

  // Reemplazo de puntos por comas en el kilometraje
  const kilometrajeFormateado = inputKilometraje.value.replace(/\./g, ',');

  if (modalidad === "Carrera") {
    // Estructura para Carrera (13 campos)
    datosFormulario = {
      "447695566": getTinyBD("nombre"),
      "2081534771": getTinyBD("fecha"),
      "1398928361": getTinyBD("estatus"),
      "1365149838": getTinyBD("duración"),
      "588570418": getTinyBD("rpe"),
      "1741028914": getTinyBD("entrenamiento"),
      "1559998109": selectModalidad.value,
      "2044148955": selectTipo.value,
      "1154502400": kilometrajeFormateado,
      "974882316": inputPulso.value,
      "536031654": inputMin.value,
      "167727428": inputSeg.value,
      "1787909564": textareaComentarios.value
    };

  } else if (modalidad === "Ciclismo") {
    // Estructura para Ciclismo (12 campos)
    datosFormulario = {
      "447695566": getTinyBD("nombre"),
      "2081534771": getTinyBD("fecha"),
      "1398928361": getTinyBD("estatus"),
      "1365149838": getTinyBD("duración"),
      "588570418": getTinyBD("rpe"),
      "1741028914": getTinyBD("entrenamiento"),
      "1559998109": selectModalidad.value,
      "1179324040": selectTipo.value,
      "1748461340": kilometrajeFormateado,
      "138731787": inputPulso.value,
      "942369874": inputMin.value,
      "1787909564": textareaComentarios.value
    };

  } else {
    // Estructura para Fuerza u Otro (8 campos)
    datosFormulario = {
      "447695566": getTinyBD("nombre"),
      "2081534771": getTinyBD("fecha"),
      "1398928361": getTinyBD("estatus"),
      "1365149838": getTinyBD("duración"),
      "588570418": getTinyBD("rpe"),
      "1741028914": getTinyBD("entrenamiento"),
      "2051757060": selectTipo.value || "",
      "1156962475": kilometrajeFormateado,
      "1787909564": textareaComentarios.value
    };
  }

  // Petición HTTP POST al script de Google Apps
  statusMessage.style.color = "blue";
  statusMessage.textContent = "Enviando datos...";

  fetch(scriptRPE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(datosFormulario),
    mode: "no-cors"
  })
  .then(() => {
    statusMessage.style.color = "green";
    statusMessage.textContent = "¡Registro enviado con éxito!";
  })
  .catch(error => {
    console.error("Error al enviar:", error);
    statusMessage.style.color = "red";
    statusMessage.textContent = "Error al enviar los datos.";
  });
});

// Ejecutar inicialización al cargar la página
initializeScreen();
