let miGrafico = null;

document.addEventListener("DOMContentLoaded", () => {
  // 1. Validar usuario activo
  const usuario = localStorage.getItem('Usuario') || sessionStorage.getItem('usuarioLogueado');
  if (!usuario) {
    window.location.href = 'index.html';
    return;
  }
  document.getElementById("usuario-display").textContent = `Usuario: ${usuario}`;

  // 2. Cargar los elementos del Test guardados en localStorage (precargados en el menú)
  cargarSelectsTest();

  // 3. Botón Menú Principal
  document.getElementById("btnMenu").addEventListener("click", () => {
    window.location.href = "Menu_principal.html"; // Ajusta el nombre de tu archivo de menú si difiere
  });
});

/**
 * Rellena los selectores de Test 1 y Test 2 con la lista almacenada en localStorage
 */
function cargarSelectsTest() {
  const select1 = document.getElementById("test1");
  const select2 = document.getElementById("test2");

  try {
    const testGuardadosJson = localStorage.getItem('Test');
    
    if (!testGuardadosJson) {
      console.warn("No se encontró la lista 'Test' en localStorage. Asegúrate de pasar por el menú principal.");
      return;
    }

    const listaTests = JSON.parse(testGuardadosJson);

    if (Array.isArray(listaTests)) {
      listaTests.forEach(item => {
        // Asegurar compatibilidad tanto si es un array de strings como si es un objeto
        const valorItem = typeof item === 'object' ? (item.nombre || item.valor || Object.values(item)[0]) : item;

        const opt1 = document.createElement("option");
        opt1.value = valorItem;
        opt1.textContent = valorItem;
        select1.appendChild(opt1);

        const opt2 = document.createElement("option");
        opt2.value = valorItem;
        opt2.textContent = valorItem;
        select2.appendChild(opt2);
      });
      console.log("✓ Opciones de Test cargadas en los desplegables correctamente.");
    }
  } catch (err) {
    console.error("Error al parsear la lista 'Test' del localStorage:", err);
  }
}

// 4. Lógica del Botón Enviar (Consulta de Gráfica)
document.getElementById("btnEnviar").addEventListener("click", async () => {
  const mensajeEl = document.getElementById("mensaje-loading");
  const canvas = document.getElementById("canvasGrafica");

  const usuario = localStorage.getItem('Usuario') || sessionStorage.getItem('usuarioLogueado');
  const dias = document.getElementById("selectDias").value;
  const t1 = document.getElementById("test1").value;
  const lat1 = document.getElementById("lateralidad1").value;
  const t2 = document.getElementById("test2").value;
  const lat2 = document.getElementById("lateralidad2").value;

  if (!t1) {
    alert("Comprueba los campos obligatorios (Variable 1)");
    document.getElementById("test1").style.borderColor = "#ff0000";
    return;
  }
  document.getElementById("test1").style.borderColor = "#ccc";

  // Construcción de etiquetas según la lógica de lateralidad (idéntico a App Inventor)
  const dato4 = lat1 === "BILATERAL" ? t1 : `${t1}${lat1}`;
  const dato5 = t2 ? (lat2 === "BILATERAL" ? t2 : `${t2}${lat2}`) : "";
  
  // Obtener fecha actual en formato YYYY-MM-DD
  const fechaHoy = new Date().toISOString().split('T')[0];

  // Recuperar la URL del script (desde la URL o de localStorage)
  const paramsUrl = new URLSearchParams(window.location.search);
  const scriptUrl = paramsUrl.get("script") || localStorage.getItem('script');

  if (!scriptUrl) {
    mensajeEl.innerText = "Error: No se encontró la URL del Apps Script.";
    return;
  }

  mensajeEl.style.display = "block";
  mensajeEl.innerText = "Cargando datos de la consulta...";

  try {
    // Petición POST idéntica a la que hacía el bloque Web de App Inventor
    const bodyData = new URLSearchParams({
      tipo: "cincoDatos",
      dato1: usuario,
      dato2: fechaHoy,
      dato3: dias,
      dato4: dato4,
      dato5: dato5
    });

    const urlConsulta = `${scriptUrl}?accion=graficaTest&t=${Date.now()}`;
    const respuesta = await fetch(urlConsulta, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: bodyData.toString()
    });

    if (!respuesta.ok) {
      throw new Error(`HTTP Error: ${respuesta.status}`);
    }

    const data = await respuesta.json();

    if (!Array.isArray(data) || data.length < 2) {
      mensajeEl.innerText = "No se encontraron datos para los parámetros seleccionados.";
      if (miGrafico) miGrafico.destroy();
      return;
    }

    mensajeEl.style.display = "none";

    const cabeceras = data[0];
    const filas = data.slice(1);

    const fechas = filas.map(f => f[0]);
    const valoresVar1 = filas.map(f => f[1]);
    const valoresVar2 = filas.map(f => f[2]);

    const labelVar1 = cabeceras[1] || t1;
    const labelVar2 = cabeceras[2] || t2;

    const ctx = canvas.getContext("2d");
    if (miGrafico) {
      miGrafico.destroy();
    }

    miGrafico = new Chart(ctx, {
      type: "line",
      data: {
        labels: fechas,
        datasets: [
          {
            label: labelVar1,
            data: valoresVar1,
            borderColor: "#0288D1",
            backgroundColor: "rgba(2, 136, 209, 0.15)",
            borderWidth: 2,
            pointRadius: 4,
            tension: 0.2,
            fill: true
          },
          ...(t2 && valoresVar2.some(v => v !== undefined && v !== "") ? [{
            label: labelVar2,
            data: valoresVar2,
            borderColor: "#D32F2F",
            backgroundColor: "rgba(211, 47, 47, 0.15)",
            borderWidth: 2,
            pointRadius: 4,
            tension: 0.2,
            fill: true
          }] : [])
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top" }
        },
        scales: {
          x: { title: { display: true, text: "Fecha" }, grid: { display: false } },
          y: { title: { display: true, text: "Valor" }, beginAtZero: false }
        }
      }
    });

  } catch (err) {
    console.error("Error cargando la gráfica:", err);
    mensajeEl.innerText = "Ocurrió un error al cargar la gráfica.";
  }
});
