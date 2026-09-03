document.addEventListener("DOMContentLoaded", () => {
  // 1. Inyectar estilos para el slider en dispositivos móviles
  const style = document.createElement("style");
  style.textContent = `
    input[type="range"].mobile-slider {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      height: 12px;
      border-radius: 6px;
      outline: none;
      margin: 10px 0;
      cursor: pointer;
    }
    input[type="range"].mobile-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: #ffffff;
      border: 2px solid #0f172a;
      box-shadow: 0 2px 6px rgba(0,0,0,0.25);
      cursor: pointer;
    }
    input[type="range"].mobile-slider::-moz-range-thumb {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: #ffffff;
      border: 2px solid #0f172a;
      box-shadow: 0 2px 6px rgba(0,0,0,0.25);
      cursor: pointer;
    }
    .input-error {
      border-color: #ef4444 !important;
      background-color: #fef2f2 !important;
    }
  `;
  document.head.appendChild(style);

  // 2. Elementos del DOM
  const userDisplay = document.getElementById("user-display");
  const nombreInput = document.getElementById("nombre");
  const fechaInput = document.getElementById("fecha");
  const estatusSelect = document.getElementById("estatus");
  const duracionInput = document.getElementById("duracion");
  const rpeSlider = document.getElementById("rpe");
  const valRpeSpan = document.getElementById("val-rpe");
  const entrenamientoSelect = document.getElementById("entrenamiento");
  const btnAtras = document.getElementById("btnAtras");
  const btnSiguiente = document.getElementById("btnSiguiente");

  // 3. Inicialización de datos
  const usuario = localStorage.getItem("Usuario") || sessionStorage.getItem("Usuario") || localStorage.getItem("usuarioLogueado") || "";
  
  if (userDisplay) {
    userDisplay.textContent = usuario ? `Usuario: ${usuario}` : "Sin usuario";
  }
  nombreInput.value = usuario;

  // Fecha por defecto: Hoy (YYYY-MM-DD)
  const hoy = new Date().toISOString().split("T")[0];
  fechaInput.value = hoy;

  // Cargar último entrenamiento usado
  entrenamientoSelect.value = localStorage.getItem("Last") || "";

  // 4. Configurar el Slider RPE (inicialmente no tocado)
  rpeSlider.dataset.touched = "false";
  rpeSlider.style.background = "linear-gradient(to right, #22c55e, #eab308, #ef4444)";

  const markAsTouched = (e) => {
    e.target.dataset.touched = "true";
    if (valRpeSpan) {
      valRpeSpan.textContent = e.target.value;
    }
    rpeSlider.classList.remove("input-error");
  };

  rpeSlider.addEventListener("input", markAsTouched);
  rpeSlider.addEventListener("change", markAsTouched);

  // Helper para obtener el valor del RPE solo si fue desplazado
  const getRpeValue = () => {
    return rpeSlider.dataset.touched === "true" ? rpeSlider.value : "";
  };

  // 5. Ajuste por cambio de estatus (Si está Lesionado, deshabilita y resetea el RPE)
  estatusSelect.addEventListener("change", () => {
    if (estatusSelect.value === "Lesionado") {
      rpeSlider.disabled = true;
      rpeSlider.dataset.touched = "false";
      if (valRpeSpan) valRpeSpan.textContent = "-";
      rpeSlider.classList.remove("input-error");
    } else {
      rpeSlider.disabled = false;
    }
  });

  // 6. Navegación hacia atrás
  if (btnAtras) {
    btnAtras.addEventListener("click", () => {
      window.location.href = "menu_principal.html";
    });
  }

  // 7. Evento Clic en Siguiente / Guardar
  btnSiguiente.addEventListener("click", (e) => {
    e.preventDefault();
    let esValido = true;

    // Resetear estilos de error previos
    [nombreInput, fechaInput, estatusSelect, duracionInput, rpeSlider, entrenamientoSelect].forEach((el) => {
      if (el) el.classList.remove("input-error");
    });

    // Validaciones
    if (!nombreInput.value.trim()) {
      nombreInput.classList.add("input-error");
      esValido = false;
    }

    if (!fechaInput.value) {
      fechaInput.classList.add("input-error");
      esValido = false;
    }

    if (!estatusSelect.value) {
      estatusSelect.classList.add("input-error");
      esValido = false;
    }

    if (!duracionInput.value.trim()) {
      duracionInput.classList.add("input-error");
      esValido = false;
    }

    // RPE es obligatorio solo si el estatus es Completo o Limitado
    const requiereRpe = estatusSelect.value === "Completo" || estatusSelect.value === "Limitado";
    const valorRpe = getRpeValue();

    if (requiereRpe && valorRpe === "") {
      rpeSlider.classList.add("input-error");
      esValido = false;
    }

    if (!entrenamientoSelect.value) {
      entrenamientoSelect.classList.add("input-error");
      esValido = false;
    }

    if (!esValido) {
      alert("Comprueba los campos obligatorios");
      return;
    }

    // Comprobación de condición final de RPE
    const condicionRpeCorrecta =
      (requiereRpe && valorRpe !== "") ||
      (estatusSelect.value === "Lesionado" && valorRpe === "");

    if (condicionRpeCorrecta) {
      // Guardar datos en localStorage
      localStorage.setItem("nombre", nombreInput.value.trim());
      localStorage.setItem("fecha", fechaInput.value);
      localStorage.setItem("estatus", estatusSelect.value);
      localStorage.setItem("duración", duracionInput.value.trim());
      localStorage.setItem("rpe", valorRpe);
      localStorage.setItem("entrenamiento", entrenamientoSelect.value);

      // Navegar a la pantalla RPE2
      window.location.href = "rpe2.html";
    } else {
      alert("Comprueba los valores de los campos obligatorios");
    }
  });
});
