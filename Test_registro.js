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

  // Obtener usuario activo unificando localStorage y sessionStorage
  const usuarioActivo = localStorage.getItem("Usuario") || sessionStorage.getItem("usuarioLogueado") || "";
  
  // Si no hay usuario o no se pasó por el menú principal (verificando que existan las listas base), se redirige
  const testsGuardados = JSON.parse(localStorage.getItem("Test") || "[]");
  if (!usuarioActivo || testsGuardados.length === 0) {
    window.location.href = 'index.html';
    return;
  }

  inputNombre.value = usuarioActivo;
  inputNombre.style.backgroundColor = "#ffffff";

  // Cargar la fecha actual (YYYY-MM-DD)
  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, '0');
  const day = String(hoy.getDate()).padStart(2, '0');
  inputFecha.value = `${year}-${month}-${day}`;

  // Cargar opciones en el select de TEST desde localStorage
  selectTest.innerHTML = '<option value="" disabled selected>Selecciona test</option>';
  testsGuardados.forEach(item => {
    const opt = document.createElement("option");
    opt.value = item;
    opt.textContent = item;
    selectTest.appendChild(opt);
  });

  // Evento UniMulti
  selectUniMulti.addEventListener("change", () => {
    selectTest.value = "";
    inputResultadoPRE.value = "";
    
    const seleccion = selectUniMulti.value;

    if (seleccion === "Bilateral") {
      selectLateralidad.disabled = true;
      groupLateralidad.classList.add("hidden");
      selectLateralidad.value = "";
      selectTest.disabled = false;
      inputResultadoPRE.disabled = false;
    } else if (seleccion === "Unilateral") {
      selectLateralidad.disabled = false;
      groupLateralidad.classList.remove("hidden");
      selectTest.disabled = false;
      inputResultadoPRE.disabled = false;
    }
  });

  // Evento TEST
  selectTest.addEventListener("change", () => {
    inputResultadoPRE.value = selectTest.value;
  });

  // Evento Botón Enviar
  btnEnviar.addEventListener("click", () => {
    let valido = true;

    // Validación Nombre
    if (inputNombre.value.trim() === "") {
      inputNombre.style.backgroundColor = "#ff0000";
      valido = false;
    } else {
      inputNombre.style.backgroundColor = "#ffffff";
    }

    // Validación Fecha
    if (inputFecha.value.trim() === "") {
      inputFecha.style.backgroundColor = "#ff0000";
      valido = false;
    } else {
      inputFecha.style.backgroundColor = "#ffffff";
    }

    // Validación Resultado_PRE (Corregido el color al elemento correcto)
    if (inputResultadoPRE.value.trim() === "") {
      inputResultadoPRE.style.backgroundColor = "#ff0000";
      valido = false;
    } else {
      inputResultadoPRE.style.backgroundColor = "#ffffff";
    }

    // Validación Resultado
    if (inputResultado.value.trim() === "") {
      inputResultado.style.backgroundColor = "#ff0000";
      valido = false;
    } else {
      inputResultado.style.backgroundColor = "#ffffff";
    }

    if (!valido) {
      alert("Comprueba los campos obligatorios");
      return;
    }

    // Envío a Google Forms
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

    fetch(fullUrl, { method: "GET", mode: "no-cors" })
      .then(() => {
        divNotificador.textContent = "Respuestas enviadas correctamente";
      })
      .catch(() => {
        divNotificador.textContent = "Respuestas enviadas correctamente";
      });
  });

  // Evento Botón Menú
  btnMenu.addEventListener("click", () => {
    window.location.href = "menu_principal.html";
  });
});
