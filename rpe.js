document.addEventListener("DOMContentLoaded", () => {
  // Elementos del DOM
  const nombreInput = document.getElementById("nombre");
  const fechaInput = document.getElementById("fecha");
  const estatusSelect = document.getElementById("estatus");
  const duracionInput = document.getElementById("duracion");
  const rpeSelect = document.getElementById("rpe");
  const entrenamientoSelect = document.getElementById("entrenamiento");
  const btnSiguiente = document.getElementById("btnSiguiente");

  // Inicialización (RPE Initialize)
  // Carga nombre desde TinyDB/localStorage o cadena vacía
  nombreInput.value = localStorage.getItem("Usuario") || "";

  // Fecha por defecto: Hoy (YYYY-MM-DD)
  const hoy = new Date().toISOString().split("T")[0];
  fechaInput.value = hoy;

  // Carga el último entrenamiento usado o valor por defecto
  entrenamientoSelect.value = localStorage.getItem("Last") || "";

  // Ajuste según cambio de estatus (si está lesionado, inhabilita RPE)
  estatusSelect.addEventListener("change", () => {
    if (estatusSelect.value === "Lesionado") {
      rpeSelect.value = "";
      rpeSelect.disabled = true;
    } else {
      rpeSelect.disabled = false;
    }
  });

  // Evento Clic en Siguiente
  btnSiguiente.addEventListener("click", () => {
    let esValido = true;

    // Resetear estilos de error previos
    [nombreInput, fechaInput, estatusSelect, duracionInput, rpeSelect, entrenamientoSelect].forEach(el => {
      el.classList.remove("input-error");
    });

    // Validaciones campo por campo
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

    // RPE es obligatorio si el estatus es Completo o Limitado
    const requiereRpe = estatusSelect.value === "Completo" || estatusSelect.value === "Limitado";
    if (requiereRpe && !rpeSelect.value) {
      rpeSelect.classList.add("input-error");
      esValido = false;
    }

    if (!entrenamientoSelect.value) {
      entrenamientoSelect.classList.add("input-error");
      esValido = false;
    }

    if (!esValido) {
      alert("Comprueba campos obligatorios");
      return;
    }

    // Lógica global corregida: Permite guardar tanto para Completo/Limitado con RPE como para Lesionado sin RPE
    const condicionRpeCorrecta = (requiereRpe && rpeSelect.value !== "") || 
                                (estatusSelect.value === "Lesionado" && rpeSelect.value === "");

    if (condicionRpeCorrecta) {
      // Guardar datos en localStorage (Reemplaza los StoreValue de TinyDB)
      localStorage.setItem("nombre", nombreInput.value.trim());
      localStorage.setItem("fecha", fechaInput.value);
      localStorage.setItem("estatus", estatusSelect.value);
      localStorage.setItem("duración", duracionInput.value.trim());
      localStorage.setItem("rpe", rpeSelect.value);
      localStorage.setItem("entrenamiento", entrenamientoSelect.value);

      // Navegar a la pantalla RPE2
      window.location.href = "rpe2.html";
    } else {
      alert("Comprueba valores de campos obligatorios");
    }
  });
});
