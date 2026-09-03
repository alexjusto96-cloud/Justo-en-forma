document.addEventListener("DOMContentLoaded", () => {
  // Elementos del DOM
  const inputNombre = document.getElementById("nombre");
  const inputFecha = document.getElementById("fecha");
  const selectUniMulti = document.getElementById("uniMulti");
  const groupLateralidad = document.getElementById("group-lateralidad");
  const selectLateralidad = document.getElementById("lateralidad");
  const selectTest = document.getElementById("test");
  const inputResultadoPRE = document.getElementById("resultadoPRE");
  const inputResultado = document.getElementById("resultado");
  const inputObservaciones = document.getElementById("observaciones");
  const btnEnviar = document.getElementById("btnEnviar");
  const btnMenu = document.getElementById("btnMenu");
  const divNotificador = document.getElementById("notificador");

  // Simuladores de TinyDB (localStorage)
  const usuarioGuardado = localStorage.getItem("Usuario") || "";
  const testsGuardados = JSON.parse(localStorage.getItem("Test") || "[]");

  // Inicialización (Screen.Initialize)
  inputNombre.value = usuarioGuardado;
  inputNombre.style.backgroundColor = "#ffffff";

  // Cargar la fecha actual (YYYY-MM-DD)
  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, '0');
  const day = String(hoy.getDate()).padStart(2, '0');
  inputFecha.value = `${year}-${month}-${day}`;

  // Cargar opciones en el select de TEST según TinyDB
  selectTest.innerHTML = '<option value="" disabled selected>Selecciona test</option>';
  if (Array.isArray(testsGuardados)) {
    testsGuardados.forEach(item => {
      const opt = document.createElement("option");
      opt.value = item;
      opt.textContent = item;
      selectTest.appendChild(opt);
    });
  }

  // Evento UniMulti (AfterPicking)
  selectUniMulti.addEventListener("change", () => {
    selectTest.value = "";
    inputResultadoPRE.value = "";
    
    const seleccion = selectUniMulti.value;

    if (seleccion === "Bilateral") {
      selectLateralidad.disabled = true;
      groupLateralidad.classList.add("hidden");
      inputResultadoPRE.value = "";
      selectTest.disabled = false;
      inputResultadoPRE.disabled = false;
    } else if (seleccion === "Unilateral") {
      selectLateralidad.disabled = false;
      groupLateralidad.classList.remove("hidden");
      inputResultadoPRE.value = "";
      selectTest.disabled = false;
      inputResultadoPRE.disabled = false;
    }
  });

  // Evento Lateralidad (AfterPicking)
  selectLateralidad.addEventListener("change", () => {
    // Mantiene la selección activa
  });

  // Evento TEST (AfterPicking)
  selectTest.addEventListener("change", () => {
    inputResultadoPRE.value = selectTest.value;
  });

  // Evento Botón Enviar (Click)
  btnEnviar.addEventListener("click", () => {
    let valido = true;

    // Validación Nombre
    if (inputNombre.value.trim() === "") {
      inputNombre.style.backgroundColor = "#ff0000";
      alert("Comprueba los campos obligatorios");
      valido = false;
    } else {
      inputNombre.style.backgroundColor = "#ffffff";
    }

    // Validación Fecha
    if (inputFecha.value.trim() === "") {
      inputFecha.style.backgroundColor = "#ff0000";
      alert("Comprueba los campos obligatorios");
      valido = false;
    } else {
      inputFecha.style.backgroundColor = "#ffffff";
    }

    // Validación Resultado_PRE
    if (inputResultadoPRE.value.trim() === "") {
      alert("Comprueba los campos obligatorios");
      inputResultado.style.backgroundColor = "#ff0000";
      valido = false;
    } else {
      inputResultado.style.backgroundColor = "#ffffff";
    }

    // Validación Resultado
    if (inputResultado.value.trim() === "") {
      alert("Comprueba los campos obligatorios");
      inputResultado.style.backgroundColor = "#ff0000";
      valido = false;
    } else {
      inputResultado.style.backgroundColor = "#ffffff";
    }

    // Si todo es válido, realiza el envío POST/GET a Google Forms
    if (valido) {
      const baseUrl = "https://docs.google.com/forms/d/e/1FAIpQLSeRxOtwwOBM4TpviGO3f0WolnSy18VBjjZIe_EY-cvYAnJu_A/formResponse";
      
      const params = new URLSearchParams({
        "entry.1605752120": inputNombre.value,
        "entry.118908139": inputFecha.value,
        "entry.335892241": inputResultadoPRE.value,
        "entry.1540418146": selectLateralidad.value || "",
        "entry.1648244417": inputResultado.value,
        "entry.1814970791": inputObservaciones.value
      });

      const fullUrl = `${baseUrl}?${params.toString()}`;

      // Envío mediante request 'no-cors' para simular el comportamiento Web1.Get
      fetch(fullUrl, { method: "GET", mode: "no-cors" })
        .then(() => {
          divNotificador.textContent = "Respuestas enviadas correctamente";
        })
        .catch(() => {
          divNotificador.textContent = "Respuestas enviadas correctamente";
        });
    }
  });

  // Evento Botón Menú
  btnMenu.addEventListener("click", () => {
    window.location.href = "menu_principal.html";
  });
});
