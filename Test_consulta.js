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
  
  const userDisplayEl = document.getElementById("usuario-display") || document.getElementById("user-display");
  if (userDisplayEl) {
    userDisplayEl.textContent = usuario;
  }
  const inputNombre = document.getElementById("nombre");
  if (inputNombre) {
    inputNombre.value = usuario;
  }

  // 2. Cargar los elementos combinados (LocalStorage 'Test' + Valores Fijos)
  cargarSelectsTest();

  // 3. Botón Menú Principal / Atrás
  const btnMenu = document.getElementById("btnMenu") || document.getElementById("btnAtras");
  if (btnMenu) {
    btnMenu.addEventListener("click", () => {
      window.location.href = "Menu_principal.html";
    });
  }
});

/**
 * Rellena los selectores uniendo los datos de localStorage con los 8 valores fijos obligatorios.
 */
function cargarSelectsTest() {
  const select1 = document.getElementById("test1");
  const select2 = document.getElementById("test2");
  if (!select1 || !select2) return;

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

// 4. Lógica del Botón Enviar (Ejecuta el Fetch al Sheet + Carga el Visor Iframe)
const btnEnviar = document.getElementById("btnEnviar") || document.getElementById("btnSiguiente");
if (btnEnviar) {
  btnEnviar.addEventListener("click", async () => {
    const mensajeEl = document.getElementById("mensaje-loading");

    // Recoger los valores de la interfaz
    const usuario = localStorage.getItem('Usuario') || sessionStorage.getItem('usuarioLogueado');
    const dias = document.getElementById("selectDias") ? document.getElementById("selectDias").value : "7";
    const t1 = document.getElementById("test1") ? document.getElementById("test1").value : "";
    const lat1 = document.getElementById("lateralidad1") ? document.getElementById("lateralidad1").value : "BILATERAL";
    const t2 = document.getElementById("test2") ? document.getElementById("test2").value : "";
    const lat2 = document.getElementById("lateralidad2") ? document.getElementById("lateralidad2").value : "BILATERAL";

    // Validación básica del campo obligatorio
    const test1El = document.getElementById("test1");
    if (test1El) {
      if (!t1) {
        alert("Comprueba los campos obligatorios (Variable 1)");
        test1El.style.borderColor = "#ff0000";
        return;
      }
      test1El.style.borderColor = "#cbd5e1";
    }

    // Construcción de etiquetas según la lógica de lateralidad
    const dato4 = lat1 === "BILATERAL" ? t1 : `${t1}${lat1}`;
    const dato5 = t2 ? (lat2 === "BILATERAL" ? t2 : `${t2}${lat2}`) : "";
    
    // Obtener fecha actual en formato YYYY-MM-DD
    const fechaHoy = new Date().toISOString().split('T')[0];

    // Recuperar la URL del script (desde la URL o el localStorage)
    const paramsUrl = new URLSearchParams(window.location.search);
    const scriptUrl = paramsUrl.get("script") || localStorage.getItem('script');

    if (!scriptUrl) {
      alert("Error: No se encontró la URL del Apps Script.");
      return;
    }

    // Mostrar mensaje de carga mientras se procesa
    const mainContainer = document.getElementById("containerIframe") || document.body;
    let loadingContainer = mensajeEl;
    if (!loadingContainer) {
      loadingContainer = document.createElement("div");
      loadingContainer.id = "mensaje-loading";
      loadingContainer.style.textAlign = "center";
      loadingContainer.style.marginTop = "16px";
      loadingContainer.style.fontWeight = "600";
      loadingContainer.style.color = "#2563eb";
      mainContainer.appendChild(loadingContainer);
    }
    loadingContainer.style.display = "block";
    loadingContainer.innerText = "Procesando datos y cargando visor...";

    try {
      // 1. Ejecutar la petición POST en segundo plano hacia el Google Sheet
      const bodyData = new URLSearchParams({
        tipo: "cincoDatos",
        dato1: usuario,
        dato2: fechaHoy,
        dato3: dias,
        dato4: dato4,
        dato5: dato5
      });

      const urlConsulta = `${scriptUrl}?accion=graficaTest&t=${Date.now()}`;
      
      // Lanzamos el fetch de forma asíncrona para que el Sheet reciba y procese la info
      fetch(urlConsulta, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: bodyData.toString()
      }).catch(err => console.error("Error en la petición al sheet:", err));

    } catch (err) {
      console.error("Error al preparar la petición:", err);
    }

    // 2. Esperar 2 segundos y desplegar el visor iframe limpio en pantalla
    setTimeout(() => {
      loadingContainer.style.display = "none";

      // Generar entero aleatorio entre 0 y 9999
      const randomNum = Math.floor(Math.random() * 10000);
      const urlDestino = `https://alexjusto96-cloud.github.io/Gr-fico-TEST/?t=${randomNum}`;

      // Comprobar si ya existe el único iframe creado, si no, crearlo dentro del contenedor
      let iframeViewer = document.getElementById("webViewerFrame");
      if (!iframeViewer) {
        iframeViewer = document.createElement("iframe");
        iframeViewer.id = "webViewerFrame";
        iframeViewer.style.width = "100%";
        iframeViewer.style.height = "500px";
        iframeViewer.style.border = "none";
        iframeViewer.style.borderRadius = "12px";
        iframeViewer.style.marginTop = "20px";
        iframeViewer.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";

        const targetContainer = document.getElementById("containerIframe") || mainContainer;
        targetContainer.appendChild(iframeViewer);
      }

      // Asignar la URL con el parámetro aleatorio al visor único
      iframeViewer.src = urlDestino;
      
      // Desplazarse suavemente hacia la zona del visor
      iframeViewer.scrollIntoView({ behavior: 'smooth' });
    }, 2000);
  });
}
