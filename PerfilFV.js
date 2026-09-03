// Simulación de TinyDB con LocalStorage y manejo seguro de errores
const TinyDB1 = {
  getValue: function(key, notFoundValue) {
    const val = localStorage.getItem(key);
    if (val === null) return notFoundValue;
    
    try {
      return JSON.parse(val);
    } catch (e) {
      return val;
    }
  }
};

// Variables globales
let globalJson = "";
let globalDate = "";
let globalLongitud = 0;
let listaEjerciciosGlobal = []; // Copia para realizar el filtrado de búsqueda
const scriptUrl = "https://script.google.com/macros/s/AKfycbyPfGgRmGtJ6R_5P3NA6D7dhbT0CYW0Aw6i053H-F13PpvARKWYdV_MLxtymgmglUcd6Q/exec";

// Referencias al DOM
const listPicker1 = document.getElementById('listPicker1');
const textBox11 = document.getElementById('textBox11');
const checkBox1 = document.getElementById('checkBox1');
const button1 = document.getElementById('button1'); // Consultar
const button2 = document.getElementById('button2'); // Grabar
const button3 = document.getElementById('button3'); // Menu Principal
const mejorText = document.getElementById('mejorText');
const v1rmText = document.getElementById('v1rmText');

// 1. Inicialización
document.addEventListener('DOMContentLoaded', () => {
  // Obtener usuario activo
  globalJson = TinyDB1.getValue('Usuario', '') || sessionStorage.getItem('usuarioLogueado') || '';

  // Fecha YYYY-M-D
  const today = new Date();
  globalDate = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

  // Cargar lista 'Ejercicio' desde localStorage
  const ejercicios = TinyDB1.getValue('Ejercicio', []);

  if (Array.isArray(ejercicios)) {
    listaEjerciciosGlobal = ejercicios;
  } else if (typeof ejercicios === 'string' && ejercicios.length > 0) {
    listaEjerciciosGlobal = ejercicios.split(',').map(e => e.trim());
  }

  // Crear dinámicamente el campo de búsqueda sobre el listPicker1
  crearBuscadorEjercicios();

  // Poblar el desplegable por primera vez
  renderizarOpciones(listaEjerciciosGlobal);
});

/**
 * Crea e inserta un input de búsqueda justo encima del desplegable
 */
function crearBuscadorEjercicios() {
  if (!listPicker1) return;

  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.id = 'searchEjercicio';
  searchInput.placeholder = '🔍 Buscar ejercicio...';
  searchInput.style.cssText = 'width: 100%; padding: 8px; margin-bottom: 6px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px;';

  // Evento de filtrado en tiempo real
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    const ejerciciosFiltrados = listaEjerciciosGlobal.filter(e => 
      e.toLowerCase().includes(query)
    );
    renderizarOpciones(ejerciciosFiltrados);
  });

  // Insertar el input antes del select
  listPicker1.parentNode.insertBefore(searchInput, listPicker1);
}

/**
 * Renderiza las opciones del <select> basándose en un array de cadenas
 */
function renderizarOpciones(lista) {
  if (!listPicker1) return;

  listPicker1.innerHTML = '<option value="" disabled selected>Selecciona ejercicio</option>';

  if (lista.length === 0) {
    const option = document.createElement('option');
    option.disabled = true;
    option.textContent = 'Sin coincidencias';
    listPicker1.appendChild(option);
    return;
  }

  lista.forEach(ejercicio => {
    const option = document.createElement('option');
    option.value = ejercicio;
    option.textContent = ejercicio;
    listPicker1.appendChild(option);
  });
}

// 2. Selección en desplegable -> Pasa a textBox11
listPicker1.addEventListener('change', () => {
  textBox11.value = listPicker1.value;
});

// 3. Botón "Menu Principal" -> Redirige a menu_principal.html
button3.addEventListener('click', () => {
  window.location.href = "menu_principal.html";
});

// 4. Botón "Consultar" -> Envía los datos vía POST a doPostPerfilFV en Apps Script
button1.addEventListener('click', () => {
  const tb1 = document.getElementById('textBox1')?.value || '';
  const tb2 = document.getElementById('textBox2')?.value || '';
  const tb3 = document.getElementById('textBox3')?.value || '';
  const tb4 = document.getElementById('textBox4')?.value || '';
  const tb5 = document.getElementById('textBox5')?.value || '';
  const tb6 = document.getElementById('textBox6')?.value || '';
  const tb7 = document.getElementById('textBox7')?.value || '';
  const tb8 = document.getElementById('textBox8')?.value || '';
  const tb9 = document.getElementById('textBox9')?.value || '';
  const tb10 = document.getElementById('textBox10')?.value || '';

  // Formato JSON esperado por doPostPerfilFV (B: Cargas, D: VMP)
  const payload = {
    B: [tb1, tb3, tb5, tb7, tb9],
    D: [tb2, tb4, tb6, tb8, tb10],
    name: globalJson,
    picker: textBox11.value.trim(),
    checkbox: checkBox1.checked
  };

  fetch(scriptUrl, {
    method: 'POST',
    body: JSON.stringify(payload)
  })
    .then(response => response.json())
    .then(data => {
      // Procesa la respuesta JSON directa de doPostPerfilFV
      if (data.label12 !== undefined) {
        mejorText.textContent = data.label12;
      }
      if (data.label14 !== undefined) {
        v1rmText.textContent = data.label14;
      }

      // Muestra/actualiza el Web Viewer con el gráfico dinámico debajo de los resultados
      mostrarWebViewer();
    })
    .catch(err => console.error("Error en Consultar:", err));
});

/**
 * Crea o actualiza el iframe desplegado debajo del bloque de resultados (Best / V1RM)
 */
function mostrarWebViewer() {
  let iframe = document.getElementById('webViewerGrafico');

  // Si no existe, se crea dinámicamente e inserta tras el contenedor de V1RM / Best
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = 'webViewerGrafico';
    iframe.style.cssText = 'width: 100%; height: 400px; border: 1px solid #ccc; border-radius: 8px; margin-top: 15px;';
    
    // Identifica el bloque donde se muestran Best y V1RM para insertarlo inmediatamente debajo
    const contenedorResultados = mejorText?.closest('div') || v1rmText?.closest('div') || button1.parentNode;
    contenedorResultados.parentNode.insertBefore(iframe, contenedorResultados.nextSibling);
  }

  // Genera un nocache dinámico para asegurar que cargue la versión actualizada de los datos
  const cacheBuster = Date.now();
  iframe.src = `https://alexjusto96-cloud.github.io/Grafico/?nocache=${cacheBuster}`;
}

// 5. Botón "Grabar" -> Envío a Google Forms
button2.addEventListener('click', () => {
  const selectedExercise = textBox11.value.trim();
  const textoMejor = mejorText.textContent.trim();
  const textoV1RM = v1rmText.textContent.trim();
  const isChecked = checkBox1.checked;

  if (isChecked) {
    const web3Url = `https://docs.google.com/forms/d/1JWWKvqlswNXFEhOzJOtEMl_zLwhFx0Ek2IcpQKb8dWs/formResponse?` +
      `entry.421504529=${encodeURIComponent(globalJson)}&` +
      `entry.1295778689=${encodeURIComponent(globalDate)}&` +
      `entry.758645353=${encodeURIComponent(selectedExercise)}&` +
      `entry.610994258=${encodeURIComponent(textoV1RM)}`;

    fetch(web3Url, { mode: 'no-cors' }).catch(err => console.error("Error Web3:", err));
  }

  const cargasValidas = ["Cargas 1234", "Cargas 1235", "Cargas 1245", "Cargas 1345"];

  if (cargasValidas.includes(textoMejor)) {
    const siNoText = isChecked ? "Sí" : "No";

    const tb1 = document.getElementById('textBox1')?.value || '';
    const tb2 = document.getElementById('textBox2')?.value || '';
    const tb3 = document.getElementById('textBox3')?.value || '';
    const tb4 = document.getElementById('textBox4')?.value || '';
    const tb5 = document.getElementById('textBox5')?.value || '';
    const tb6 = document.getElementById('textBox6')?.value || '';
    const tb7 = document.getElementById('textBox7')?.value || '';
    const tb8 = document.getElementById('textBox8')?.value || '';
    const tb9 = document.getElementById('textBox9')?.value || '';
    const tb10 = document.getElementById('textBox10')?.value || '';

    let web2Url = `https://docs.google.com/forms/d/1Cjq-HmSeD7VNo0mklVg4DZhP5gM2bYWG7CmSFfTaEQo/formResponse?` +
      `entry.1102825381=${encodeURIComponent(globalJson)}&` +
      `entry.1584449220=${encodeURIComponent(globalDate)}&` +
      `entry.1565535137=${encodeURIComponent(selectedExercise)}&` +
      `entry.1203760941=${encodeURIComponent(tb2)}&` +
      `entry.562972705=${encodeURIComponent(tb1)}&` +
      `entry.1596773769=${encodeURIComponent(tb4)}&` +
      `entry.1615215809=${encodeURIComponent(tb3)}&` +
      `entry.1586228761=${encodeURIComponent(textoMejor === "Cargas 1235" || textoMejor === "Cargas 1245" ? (tb8 || tb6) : tb6)}&` +
      `entry.777431361=${encodeURIComponent(textoMejor === "Cargas 1235" || textoMejor === "Cargas 1245" ? (tb7 || tb5) : tb5)}&` +
      `entry.614158757=${encodeURIComponent(tb10 || tb8)}&` +
      `entry.1460219012=${encodeURIComponent(tb9 || tb7)}&` +
      `entry.210271129=${encodeURIComponent(siNoText)}&` +
      `entry.472309366=${encodeURIComponent(textoV1RM)}`;

    fetch(web2Url, { mode: 'no-cors' }).catch(err => console.error("Error Web2:", err));
  }
});
