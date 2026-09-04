let miGrafico = null;

// Lista fija obligatoria extraída de los bloques de App Inventor
const VALORES_FIJOS_TEST = [
  "HOOPER INDEX",
  "PESO",
  "ESTADO MUSCULAR",
  "ESTADO MENTAL",
  "ENERGÍA",
  "CALIDAD DE SUEÑO",
  "HORAS DE SUEÑO",
  "HRV"
];

document.addEventListener("DOMContentLoaded", () => {
  // 1. Validar usuario activo
  const usuario = localStorage.getItem('Usuario') || sessionStorage.getItem('usuarioLogueado');
  if (!usuario) {
    window.location.href = 'index.html';
    return;
  }
  document.getElementById("usuario-display").textContent = `Usuario: ${usuario}`;

  // 2. Cargar los elementos combinados (LocalStorage 'Test' + Valores Fijos)
  cargarSelectsTest();

  // 3. Botón Menú Principal
  document.getElementById("btnMenu").addEventListener("click", () => {
    window.location.href = "Menu_principal.html";
  });
});

/**
 * Rellena los selectores uniendo los datos de localStorage con los 8 valores fijos obligatorios.
 */
function cargarSelectsTest() {
  const select1 = document.getElementById("test1");
  const select2 = document.getElementById("test2");

  // Recoger los tests guardados en localStorage o iniciar array vacío
  let listaDinamica = [];
  try {
    const testGuardadosJson = localStorage.getItem('Test');
    if (testGuardadosJson) {
      const parsed = JSON.parse(testGuardadosJson);
      if (Array.isArray(parsed)) {
        listaDinamica = parsed.map(item => 
          typeof item === 'object' ? (item.nombre || item.valor || Object.values(item)[0]) : item
        );
      }
    }
  } catch (err) {
    console.error("Error al parsear la lista 'Test' del localStorage:", err);
  }

  // Combinar los valores fijos y los dinámicos, filtrando duplicados
  const opcionesTotales = [...new Set([...VALORES_FIJOS_TEST, ...listaDinamica])];

  opcionesTotales.forEach(valorItem => {
    if (!valorItem) return;

    const opt1 = document.createElement("option");
    opt1.value = valorItem;
    opt1.textContent = valorItem;
    select1.appendChild(opt1);

    const opt2 = document.createElement("option");
    opt2.value = valorItem;
    opt2.textContent = valorItem;
    select2.appendChild(opt2);
  });

  console.log("✓ Opciones fijas y dinámicas de Test cargadas en los desplegables correctamente.");
}

// 4. Lógica del Botón Enviar (Redirección tras 2 segundos)
document.getElementById("btnEnviar").addEventListener("click", () => {
  const mensajeEl = document.getElementById("mensaje-loading");

  // Validación básica del campo obligatorio
  const t1 = document.getElementById("test1").value;
  if (!t1) {
    alert("Comprueba los campos obligatorios (Variable 1)");
    document.getElementById("test1").style.borderColor = "#ff0000";
    return;
  }
  document.getElementById("test1").style.borderColor = "#ccc";

  // Mostrar mensaje de carga mientras espera
  if (mensajeEl) {
    mensajeEl.style.display = "block";
    mensajeEl.innerText = "Redirigiendo en 2 segundos...";
  }

  // Esperar 2 segundos (2000 milisegundos) y redirigir
  setTimeout(() => {
    window.location.href = "https://alexjusto96-cloud.github.io/Gr-fico-TEST/";
  }, 2000);
});
