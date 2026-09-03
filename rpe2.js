// Configuración Global (URL de tu Google Apps Script)
const scriptRPE = "https://script.google.com/macros/s/AKfycbzKUOOv-1nsiiBBwZ6t9cmNQw6_ogU8Eue6CnZnm0cRgxvYZq462bCMTfmj2ItoEZFF/exec";

// Opciones estándar generales (fijas para todos los usuarios)
const opcionesEstandar = {
  Carrera: ["Z2", "Tempo", "Umbral", "Series", "Otro"],
  Ciclismo: ["Z2", "Tempo", "Umbral", "Series", "Otro"]
};

// Obtención de datos del almacenamiento local (equivalente a TinyBD1)
function getTinyBD(key) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : "";
  } catch (e) {
    return localStorage.getItem(key) || "";
  }
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

// Elementos UI para el buscador tipo ListPicker
const inputSearchTipo = document.getElementById('search-tipo'); // <input type="text" id="search-tipo" placeholder="Buscar tipo...">

// Variables de estado
let opcionesActuales = [];

// Función auxiliar para habilitar/deshabilitar campos según selección
function setFormFieldsDisabled(disabled) {
  if (grpTipo) grpTipo.querySelectorAll('select, input').forEach(el => el.disabled = disabled);
  if (inputKilometraje) inputKilometraje.disabled = disabled;
  if (inputPulso) inputPulso.disabled = disabled;
  if (inputMin) inputMin.disabled = disabled;
  if (inputSeg) inputSeg.disabled = disabled;
  if (textareaComentarios) textareaComentarios.disabled = disabled;
  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.disabled = disabled;
}

// Cargar y renderizar opciones sin el "-- Seleccionar --"
function renderOptions(filtro = "") {
  selectTipo.innerHTML = "";
  
  const filtroLower = filtro.toLowerCase();

  const estandarFiltradas = opcionesActuales.estandar.filter(opt => opt.toLowerCase().includes(filtroLower));
  const especificasFiltradas = opcionesActuales.especificas.filter(opt => opt.toLowerCase().includes(filtroLower));

  if (estandarFiltradas.length > 0) {
    const groupEstandar = document.createElement('optgroup');
    groupEstandar.label = "Modalidades Generales";
    estandarFiltradas.forEach(opcion => {
      const opt = document.createElement('option');
      opt.value = opcion;
      opt.textContent = opcion;
      groupEstandar.appendChild(opt);
    });
    selectTipo.appendChild(groupEstandar);
  }

  if (especificasFiltradas.length > 0) {
    const groupEspecificas = document.createElement('optgroup');
    groupEspecificas.label = "Mis Entrenamientos Específicos";
    especificasFiltradas.forEach(opcion => {
      const opt = document.createElement('option');
      opt.value = opcion;
      opt.textContent = opcion;
      groupEspecificas.appendChild(opt);
    });
    selectTipo.appendChild(groupEspecificas);
  }
}

// 1. Inicialización según el tipo de entrenamiento (RPE2.Initialize)
function initializeScreen() {
  const entrenamiento = getTinyBD("entrenamiento");

  if (entrenamiento === "Fuerza") {
    grpModalidad.classList.add('hidden');
    grpKilometraje.classList.add('hidden');
    grpPulso.classList.add('hidden');
    grpIntensidad.classList.add('hidden');

    selectTipo.innerHTML = `
      <option value="A">Bloque A</option>
      <option value="B">Bloque B</option>
    `;
    grpTipo.classList.remove('hidden');
    setFormFieldsDisabled(false);

  } else if (entrenamiento === "Otro") {
    grpModalidad.classList.add('hidden');
    grpTipo.classList.add('hidden');
    grpPulso.classList.add('hidden');
    grpIntensidad.classList.add('hidden');

    lblKilometraje.textContent = "Notas / Distancia";
    inputKilometraje.type = "text";
    grpKilometraje.classList.remove('hidden');
    setFormFieldsDisabled(false);

  } else if (entrenamiento === "Cardio") {
    grpModalidad.classList.remove('hidden');
    grpKilometraje.classList.remove('hidden');
    grpPulso.classList.remove('hidden');
    grpIntensidad.classList.remove('hidden');

    selectModalidad.innerHTML = `
      <option value="" disabled selected hidden>-- Seleccionar Modalidad --</option>
      <option value="Carrera">Carrera</option>
      <option value="Ciclismo">Ciclismo</option>
    `;

    setFormFieldsDisabled(true);
  }
}

// Evento de búsqueda dinámica en tiempo real
if (inputSearchTipo) {
  inputSearchTipo.addEventListener('input', function(e) {
    renderOptions(e.target.value);
  });
}

// 2. Lógica al cambiar la modalidad en Cardio
selectModalidad.addEventListener('change', function() {
  const modalidad = selectModalidad.value;

  if (modalidad === "Carrera" || modalidad === "Ciclismo") {
    setFormFieldsDisabled(false);

    if (modalidad === "Carrera") {
      lblInten.textContent = "Intensidad PP (Ritmo)";
      inputMin.placeholder = "Min";
      inputSeg.classList.remove('hidden');
      delimiterSeg.classList.remove('hidden');
    } else {
      lblInten.textContent = "Intensidad PP (Watios)";
      inputMin.placeholder = "Watios";
      inputSeg.classList.add('hidden');
      delimiterSeg.classList.add('hidden');
    }

    // Preparar listas de datos
    const estandar = opcionesEstandar[modalidad] || [];
    const rawEspecificas = getTinyBD(modalidad);
    const especificas = (Array.isArray(rawEspecificas) ? rawEspecificas : [])
      .filter(opcion => !estandar.includes(opcion));

    opcionesActuales = { estandar, especificas };

    // Limpiar campo de búsqueda y renderizar directo sin opción "-- Seleccionar --"
    if (inputSearchTipo) inputSearchTipo.value = "";
    renderOptions("");

    grpTipo.classList.remove('hidden');
  }
});

// 3. Envío del Formulario al Apps Script
form.addEventListener('submit', function(e) {
  e.preventDefault();
  
  let datosFormulario = {};
  const modalidad = selectModalidad.value;
  const kilometrajeFormateado = inputKilometraje.value.replace(/\./g, ',');

  if (modalidad === "Carrera") {
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

// Inicialización de pantalla al cargar
initializeScreen();
