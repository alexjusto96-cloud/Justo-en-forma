document.addEventListener("DOMContentLoaded", () => {
  // URLs configuradas en el proyecto
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxMfiseKw7Fh810OIbEPnGrNZa-ZviQ7XYUifrdrk7lxfHdjODFPRzw0QmLehMKnicI/exec";
  const FORM_URL = "https://docs.google.com/forms/d/11buAlkSLC3jpcQ768E5E0v3ZrdQc5BaYufq69C7_5xI/formResponse";

  // Elementos HTML
  const userEl = document.getElementById("User");
  const fechaEl = document.getElementById("Fecha");
  const listPicker1 = document.getElementById("ListPicker1");
  const ejercicioInput = document.getElementById("Ejercicio");
  const textBox1 = document.getElementById("TextBox1");
  const textBox2 = document.getElementById("TextBox2");
  const textBox3 = document.getElementById("TextBox3");
  const textBox4 = document.getElementById("TextBox4");
  const label4 = document.getElementById("Label4");
  const label5 = document.getElementById("Label5");
  const btnConsultar = document.getElementById("Consultar");
  const btnGrabar = document.getElementById("Grabar");
  const slider1 = document.getElementById("Slider1");
  const sliderContainer = document.getElementById("sliderContainer");

  // --- Initialize Event ---
  function inicializarPantalla() {
    // 1. Cargar usuario de localStorage (TinyDB)
    const usuarioGuardado = localStorage.getItem("Usuario") || "";
    userEl.innerText = usuarioGuardado;

    // 2. Establecer fecha (YYYY-M-D)
    const hoy = new Date();
    const fechaTexto = `${hoy.getFullYear()}-${hoy.getMonth() + 1}-${hoy.getDate()}`;
    fechaEl.innerText = fechaTexto;

    // 3. Ocultar Slider inicialmente
    sliderContainer.classList.add("hidden");

    // 4. Cargar lista de ejercicios de localStorage (TinyDB)
    const ejerciciosRaw = localStorage.getItem("Ejercicio");
    let ejercicios = [];

    if (ejerciciosRaw) {
      try {
        ejercicios = JSON.parse(ejerciciosRaw);
      } catch (e) {
        ejercicios = ejerciciosRaw.split(",");
      }
    }

    if (Array.isArray(ejercicios)) {
      ejercicios.forEach(ej => {
        const option = document.createElement("option");
        option.value = ej.trim();
        option.textContent = ej.trim();
        listPicker1.appendChild(option);
      });
    }
  }

  // --- ListPicker AfterPicking Event ---
  listPicker1.addEventListener("change", (e) => {
    const seleccion = e.target.value;
    ejercicioInput.value = seleccion;
  });

  // --- Consultar Click Event ---
  btnConsultar.addEventListener("click", async () => {
    const scriptBaseUrl = localStorage.getItem("script") || SCRIPT_URL;

    const payload = new URLSearchParams();
    payload.append("tipo", "consultaRM");
    payload.append("valor1", userEl.innerText);
    payload.append("valor2", ejercicioInput.value);
    payload.append("texto1", textBox1.value);
    payload.append("texto2", textBox2.value);

    try {
      const response = await fetch(scriptBaseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: payload.toString()
      });

      const responseContent = await response.text();

      // GotText Logic
      textBox3.value = responseContent;
      sliderContainer.classList.remove("hidden");

      const num1 = parseFloat(textBox1.value) || 0;
      const num3 = parseFloat(responseContent) || 0;

      if (num3 !== 0) {
        const calculoRM = (100 * (num1 / num3)).toFixed(4);
        label4.innerText = `${calculoRM}% RM`;
      } else {
        label4.innerText = "0% RM";
      }

    } catch (error) {
      console.error("Error al consultar RM:", error);
    }
  });

  // --- Slider PositionChanged Event ---
  slider1.addEventListener("input", (e) => {
    const thumbPosition = parseFloat(e.target.value);
    label5.innerText = `${thumbPosition}% RM`;

    const tb3Val = parseFloat(textBox3.value) || 0;
    const kgCalculados = ((thumbPosition * tb3Val) / 100).toFixed(2);
    textBox4.value = `${kgCalculados} Kg`;
  });

  // --- Grabar Click Event ---
  btnGrabar.addEventListener("click", () => {
    const formParams = new URLSearchParams({
      "entry.31506926": userEl.innerText,
      "entry.626011015": fechaEl.innerText,
      "entry.690980099": ejercicioInput.value,
      "entry.778931423": textBox1.value,
      "entry.607658797": textBox2.value,
      "entry.1501748354": textBox3.value
    });

    const fullFormUrl = `${FORM_URL}?${formParams.toString()}`;

    // Envío silencioso mediante no-cors
    fetch(fullFormUrl, { mode: "no-cors" })
      .then(() => {
        // Redirección al menú principal
        window.location.href = "menu_principal.html";
      })
      .catch(err => {
        console.error("Error al grabar:", err);
        window.location.href = "menu_principal.html";
      });
  });

  inicializarPantalla();
});
