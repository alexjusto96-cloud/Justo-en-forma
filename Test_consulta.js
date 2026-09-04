let miGrafico = null;

// Reemplaza esta constante con la URL de tu Web App de Google Apps Script desplegada
const SCRIPT_URL = "AQUÍ_PEGA_TU_URL_DE_GOOGLE_APPS_SCRIPT";

document.getElementById("btnEnviar").addEventListener("click", async () => {
  const mensajeEl = document.getElementById("mensaje-loading");
  const canvas = document.getElementById("canvasGrafica");

  const dias = document.getElementById("selectDias").value;
  const t1 = document.getElementById("test1").value;
  const lat1 = document.getElementById("lateralidad1").value;
  const t2 = document.getElementById("test2").value;
  const lat2 = document.getElementById("lateralidad2").value;

  if (!t1) {
    alert("Comprueba los campos obligatorios (Variable 1)");
    return;
  }

  // Formatear etiquetas de envío idénticas a la lógica de tus bloques de App Inventor
  const dato4 = lat1 === "BILATERAL" ? t1 : `${t1}${lat1}`;
  const dato5 = t2 ? (lat2 === "BILATERAL" ? t2 : `${t2}${lat2}`) : "";
  
  // Obtener fecha actual en formato YYYY-MM-DD
  const fechaHoy = new Date().toISOString().split('T')[0];

  mensajeEl.style.display = "block";
  mensajeEl.innerText = "Cargando datos de la consulta...";

  try {
    // Petición POST equivalente a la que hacías con el componente Web de App Inventor
    const bodyData = new URLSearchParams({
      tipo: "cincoDatos",
      dato1: "UsuarioEjemplo", // O puedes capturarlo de localStorage si lo guardas ahí previamente
      dato2: fechaHoy,
      dato3: dias,
      dato4: dato4,
      dato5: dato5
    });

    const respuesta = await fetch(`${SCRIPT_URL}?accion=graficaTest&t=${Date.now()}`, {
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
          ...(valoresVar2.some(v => v !== undefined && v !== "") ? [{
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
