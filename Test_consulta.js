let miGrafico = null;

async function cargarYRenderizarGrafica() {
  const mensajeEl = document.getElementById("mensaje-loading");
  const canvas = document.getElementById("canvasGrafica");

  try {
    // 1. Obtener los parámetros enviados por URL desde la pantalla anterior
    const params = new URLSearchParams(window.location.search);
    const scriptUrl = params.get("script");

    if (!scriptUrl) {
      mensajeEl.innerText = "Error: URL de Apps Script no especificada.";
      return;
    }

    // 2. Realizar la petición GET a Apps Script (accion=graficaTest)
    const urlConsulta = `${scriptUrl}?accion=graficaTest&t=${Date.now()}`;
    const respuesta = await fetch(urlConsulta);

    if (!respuesta.ok) {
      throw new Error(`HTTP Error: ${respuesta.status}`);
    }

    const data = await respuesta.json();

    // Validar respuesta
    if (!Array.isArray(data) || data.length < 2) {
      mensajeEl.innerText = "No se encontraron datos para los parámetros seleccionados.";
      return;
    }

    mensajeEl.style.display = "none";

    // 3. Formatear la matriz recibida
    const cabeceras = data[0];
    const filas = data.slice(1);

    const fechas = filas.map(f => f[0]);        // Eje X: Fecha
    const valoresVar1 = filas.map(f => f[1]);   // Datos Variable 1
    const valoresVar2 = filas.map(f => f[2]);   // Datos Variable 2

    const labelVar1 = cabeceras[1] || "Variable 1";
    const labelVar2 = cabeceras[2] || "Variable 2";

    // 4. Dibujar/Actualizar gráfico en el canvas
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
          {
            label: labelVar2,
            data: valoresVar2,
            borderColor: "#D32F2F",
            backgroundColor: "rgba(211, 47, 47, 0.15)",
            borderWidth: 2,
            pointRadius: 4,
            tension: 0.2,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            labels: {
              boxWidth: 12,
              font: { size: 12 }
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: "Fecha" },
            grid: { display: false }
          },
          y: {
            title: { display: true, text: "Valor" },
            beginAtZero: false
          }
        }
      }
    });

  } catch (err) {
    console.error("Error cargando la gráfica:", err);
    mensajeEl.innerText = "Ocurrió un error al cargar la gráfica.";
  }
}

// Inicializar la carga cuando el documento esté listo
document.addEventListener("DOMContentLoaded", cargarYRenderizarGrafica);
