let dia1 = "";
let dia2 = "";
let dia3 = "";
let ahora = 0;
let calendar = 0;
let fecha = "";
let last = "";
let rm = 0;
let inicio = 0;
let timerInterval = null;
let currentTextIndex = 0;
let textosNavegacion = ["", "", ""];

const TinyDB = {
  getValue: (key, defaultValue = "") => localStorage.getItem(key) || defaultValue,
  storeValue: (key, value) => localStorage.setItem(key, value)
};

const FORM_URL = "https://docs.google.com/forms/d/1SPk8g5W4vLU2WcD8W7re3BDanaktWrd4r6GO_uS-qcI/formResponse";

document.addEventListener("DOMContentLoaded", () => {
  generarFechaActual();
  renderSeriesInputs();
  bindEvents();
  inicializarValores();
  actualizarTextoNavegacion();
});

function generarFechaActual() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  fecha = `${year}-${month}-${day}`;
}

function renderSeriesInputs() {
  const container = document.getElementById("seriesContainer");
  if (!container) return;
  container.innerHTML = "";

  for (let i = 1; i <= 6; i++) {
    const row = document.createElement("div");
    const isActiveOrNext = (i === 1 || i === 2);
    row.className = `serie-row ${!isActiveOrNext ? "disabled" : ""}`;
    row.id = `serie_row_${i}`;
    
    row.innerHTML = `
      <div class="grid-8col">
        <div><input type="checkbox" id="s${i}" ${i === 1 ? 'checked' : ''} ${i > 2 ? 'disabled' : ''}></div>
        <div style="text-align:center; font-weight:bold;">${i}</div>
        <div><input type="text" id="kg${i}" placeholder="Kg" inputmode="decimal"></div>
        <div><input type="text" id="i${i}" placeholder="Int" inputmode="decimal"></div>
        <div><input type="text" id="Rep${i}" placeholder="Reps" inputmode="numeric"></div>
        <div><input type="text" id="RIR${i}" placeholder="RIR" inputmode="decimal"></div>
        <div><input type="text" id="rec${i}" placeholder="R´" inputmode="numeric"></div>
        <div><input type="text" id="rm${i}" placeholder="RM" readonly inputmode="decimal" class="disabled-input"></div>
      </div>
    `;
    container.appendChild(row);
  }
  actualizarEstadosFilas();
  actualizarEncabezadosYComportamientoVBT();
}

function bindEvents() {
  document.getElementById("nuevoEjercicio").addEventListener("click", ejecutarNuevoEjercicio);
  document.getElementById("enviar").addEventListener("click", enviarFormularioGoogle);
  document.getElementById("consultar").addEventListener("click", consultarEntrenamientos);
  document.getElementById("fin").addEventListener("click", finalizarEntrenamiento);
  
  document.getElementById("btnVolverMenu").addEventListener("click", () => {
    window.location.href = "menu_principal.html";
  });

  document.getElementById("slider1").addEventListener("input", (e) => {
    const val = e.target.value;
    document.getElementById("percentage").value = val + "%";
    calcularRMAslider(val);
  });

  document.getElementById("btnTextPrev").addEventListener("click", () => {
    if (currentTextIndex > 0) {
      currentTextIndex--;
      actualizarTextoNavegacion();
    }
  });

  document.getElementById("btnTextNext").addEventListener("click", () => {
    if (currentTextIndex < textosNavegacion.length - 1) {
      currentTextIndex++;
      actualizarTextoNavegacion();
    }
  });

  document.getElementById("listPicker1").addEventListener("change", (e) => {
    document.getElementById("ejercicio").value = e.target.value;
    for (let i = 1; i <= 6; i++) {
      calcularRM(i);
    }
  });

  const buscadorInput = document.getElementById("buscadorEjercicio");
  if (buscadorInput) {
    buscadorInput.addEventListener("input", (e) => {
      const filtro = e.target.value.toLowerCase();
      const picker = document.getElementById("listPicker1");
      if (!picker) return;

      const opciones = picker.options;
      for (let i = 0; i < opciones.length; i++) {
        const textoOption = opciones[i].textContent.toLowerCase();
        if (i === 0) continue; 
        if (textoOption.includes(filtro)) {
          opciones[i].style.display = "";
        } else {
          opciones[i].style.display = "none";
        }
      }
    });
  }

  document.addEventListener("change", (e) => {
    const targetId = e.target.id;
    if (targetId && targetId.match(/^s[1-6]$/)) {
      const numSerie = parseInt(targetId.replace("s", ""), 10);
      manejadorCambioSerie(numSerie, e.target.checked);
    }
  });

  const vbtElement = document.getElementById("vbt");
  if (vbtElement) {
    vbtElement.addEventListener("change", () => {
      for (let i = 1; i <= 6; i++) {
        setVal(`rm${i}`, "");
      }
      actualizarMaximoRM();
      actualizarEncabezadosYComportamientoVBT();
      actualizarEstadosFilas();
      for (let i = 1; i <= 6; i++) {
        calcularRM(i);
      }
    });
  }

  document.addEventListener("input", (e) => {
    const target = e.target;
    if (target && target.tagName === "INPUT" && target.type === "text" && !target.readOnly && !target.disabled) {
      if (target.id === "textBox1" || target.id === "ejercicio" || target.id === "buscadorEjercicio") return;

      let val = target.value;
      val = val.replace(/,/g, '.');
      const filtered = val.replace(/[^0-9.]/g, '');
      const parts = filtered.split('.');
      if (parts.length > 2) {
        target.value = parts[0] + '.' + parts.slice(1).join('');
      } else {
        target.value = filtered;
      }
    }
  });

  for (let i = 1; i <= 6; i++) {
    const repInput = document.getElementById(`Rep${i}`);
    const rirInput = document.getElementById(`RIR${i}`);
    const kgInput = document.getElementById(`kg${i}`);
    const iInput = document.getElementById(`i${i}`);
    
    if (repInput) repInput.addEventListener("input", () => {
      calcularIntensidadAutomatica(i);
      calcularRM(i);
    });
    if (rirInput) rirInput.addEventListener("input", () => {
      calcularIntensidadAutomatica(i);
      calcularRM(i);
    });
    if (kgInput) kgInput.addEventListener("input", () => {
      calcularRM(i);
    });
    if (iInput) iInput.addEventListener("input", () => {
      calcularRM(i);
    });
  }
}

function calcularIntensidadAutomatica(numSerie) {
  const vbtEl = document.getElementById("vbt");
  const isVBTOn = vbtEl && vbtEl.checked;
  
  if (isVBTOn) return;

  const repsStr = getVal(`Rep${numSerie}`).trim();
  const rirStr = getVal(`RIR${numSerie}`).trim();

  if (repsStr !== "" && rirStr !== "") {
    const repsVal = parseFloat(repsStr) || 0;
    const rirVal = parseFloat(rirStr) || 0;
    const suma = repsVal + rirVal;
    setVal(`i${numSerie}`, suma > 0 ? suma : "");
  } else {
    setVal(`i${numSerie}`, "");
  }
}

function calcularRM(numSerie) {
  const vbtEl = document.getElementById("vbt");
  const isVBTOn = vbtEl && vbtEl.checked;

  const kgStr = getVal(`kg${numSerie}`).trim();
  const iStr = getVal(`i${numSerie}`).trim();
  const ejercicioVal = document.getElementById("ejercicio").value.trim();

  if (!isVBTOn) {
    if (kgStr !== "" && iStr !== "") {
      const kgVal = parseFloat(kgStr);
      const iVal = parseFloat(iStr);
      if (!isNaN(kgVal) && !isNaN(iVal) && iVal > 0) {
        const rmCalculado = kgVal * Math.pow(iVal, 0.1);
        setVal(`rm${numSerie}`, rmCalculado.toFixed(2));
      } else {
        setVal(`rm${numSerie}`, "");
      }
    } else {
      setVal(`rm${numSerie}`, "");
    }
    actualizarMaximoRM();
  } else {
    if (ejercicioVal !== "" && kgStr !== "" && iStr !== "") {
      const scriptUrl = TinyDB.getValue("script");
      if (!scriptUrl) {
        setVal(`rm${numSerie}`, "");
        actualizarMaximoRM();
        return;
      }

      const usuario = TinyDB.getValue("Usuario") || "";
      
      const payload = `tipo=consultaRM&valor1=${encodeURIComponent(usuario)}&valor2=${encodeURIComponent(ejercicioVal)}&texto1=${encodeURIComponent(kgStr)}&texto2=${encodeURIComponent(iStr)}`;

      fetch(scriptUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: payload
      })
      .then(response => response.text())
      .then(data => {
        setVal(`rm${numSerie}`, data.trim());
        actualizarMaximoRM();
      })
      .catch(err => {
        console.error("Error al calcular RM con VBT:", err);
      });
    } else {
      setVal(`rm${numSerie}`, "");
      actualizarMaximoRM();
    }
  }
}

function actualizarEncabezadosYComportamientoVBT() {
  const vbtEl = document.getElementById("vbt");
  const isVBTOn = vbtEl && vbtEl.checked;

  const headerTextI = isVBTOn ? "MVP" : "Int";
  const headerTextRIR = isVBTOn ? "VL" : "RIR";

  const gridHeader = document.querySelector(".grid-header");
  if (gridHeader && gridHeader.children.length >= 6) {
    gridHeader.children[3].innerText = headerTextI;
    gridHeader.children[5].innerText = headerTextRIR;
  }

  for (let i = 1; i <= 6; i++) {
    const inputI = document.getElementById(`i${i}`);
    const inputRIR = document.getElementById(`RIR${i}`);
    
    if (inputI) inputI.placeholder = headerTextI;
    if (inputRIR) inputRIR.placeholder = headerTextRIR;

    const chk = document.getElementById(`s${i}`);
    if (chk && chk.checked) {
      setVal(`i${i}`, "");
      setVal(`RIR${i}`, "");
    }
  }
}

function actualizarTextoNavegacion() {
  document.getElementById("navTextDisplay").innerText = textosNavegacion[currentTextIndex];
  
  const btnPrev = document.getElementById("btnTextPrev");
  const btnNext = document.getElementById("btnTextNext");
  
  if (btnPrev) btnPrev.disabled = (currentTextIndex === 0);
  if (btnNext) btnNext.disabled = (currentTextIndex === textosNavegacion.length - 1);
}

function calcularRMAslider(porcentaje) {
  const rmVal = parseFloat(document.getElementById("rmRef").value) || 0;
  const resultado = (rmVal * (porcentaje / 100)).toFixed(1);
  document.getElementById("rmResultKg").value = (rmVal > 0 ? resultado + " Kg" : "");
}

function actualizarMaximoRM() {
  let maxRM = 0;
  for (let i = 1; i <= 6; i++) {
    const val = parseFloat(getVal(`rm${i}`)) || 0;
    if (val > maxRM) maxRM = val;
  }
  const rmRefEl = document.getElementById("rmRef");
  if (rmRefEl) rmRefEl.value = maxRM > 0 ? maxRM : "";
  const sliderVal = document.getElementById("slider1").value;
  calcularRMAslider(sliderVal);
}

function inicializarValores() {
  const sliderVal = document.getElementById("slider1").value;
  document.getElementById("percentage").value = sliderVal + "%";
  document.getElementById("rmRef").value = "";
  calcularRMAslider(sliderVal);
  
  const rawEj = TinyDB.getValue("Ejercicio", "");
  const picker = document.getElementById("listPicker1");
  if (picker) {
    picker.innerHTML = '<option value="" disabled selected>Seleccionar ejercicio</option>';
    if (rawEj) {
      let lista = [];
      try {
        lista = JSON.parse(rawEj);
      } catch (e) {
        lista = rawEj.includes(",") ? rawEj.split(",") : rawEj.split("\n");
      }
      
      lista.forEach(ej => {
        const valTrim = typeof ej === 'string' ? ej.trim() : ej;
        if (valTrim) {
          const opt = document.createElement("option");
          opt.value = valTrim;
          opt.textContent = valTrim;
          picker.appendChild(opt);
        }
      });
    }
  }
}

function ejecutarNuevoEjercicio() {
  generarFechaActual();

  const picker = document.getElementById("listPicker1");
  if (picker) picker.value = "";
  document.getElementById("ejercicio").value = "";
  
  document.getElementById("con").value = "1";
  document.getElementById("pausaCon").value = "1";
  document.getElementById("ecc").value = "2";
  document.getElementById("pausaEcc").value = "1";

  for (let i = 1; i <= 6; i++) {
    const el = document.getElementById(`s${i}`);
    if (el) el.checked = (i === 1);
  }

  const vbtEl = document.getElementById("vbt");
  if (vbtEl) vbtEl.checked = false;

  actualizarEncabezadosYComportamientoVBT();
  actualizarEstadosFilas();

  document.getElementById("label32").innerText = "";

  for (let i = 1; i <= 6; i++) {
    ["kg", "i", "Rep", "RIR", "rec", "rm"].forEach(prefix => setVal(`${prefix}${i}`, ""));
  }
  setVal("textBox1", "");

  if (timerInterval) clearInterval(timerInterval);
  document.getElementById("minutos").innerText = "0";
  document.getElementById("segundos").innerText = "00";
  
  document.getElementById("slider1").value = 50;
  document.getElementById("percentage").value = "50%";
  document.getElementById("rmRef").value = "";
  calcularRMAslider(50);
  document.getElementById("label12").innerText = "";
}

function enviarFormularioGoogle() {
  const usuario = TinyDB.getValue("Usuario") || "";
  const vbtVal = document.getElementById("vbt").checked ? "TRUE" : "FALSE";
  
  // Base de tu Google Form terminada en /formResponse o /viewform
  // Usamos /viewform si quieres que se abra precargado en el navegador, 
  // o /formResponse si prefieres enviarlo en segundo plano mediante un enlace directo.
  const BASE_FORM_URL = "https://docs.google.com/forms/d/1SPk8g5W4vLU2WcD8W7re3BDanaktWrd4r6GO_uS-qcI/viewform";

  const params = new URLSearchParams({
    "entry.1052562463": usuario,
    "entry.2002526298": fecha,
    "entry.1315747589": document.getElementById("ejercicio").value,
    "entry.9949262": vbtVal,
    "entry.1445063449": document.getElementById("con").value,
    "entry.2132618651": document.getElementById("pausaCon").value,
    "entry.1198689613": document.getElementById("ecc").value,
    "entry.2062861622": document.getElementById("pausaEcc").value,
    "entry.631342381": getVal("kg1"),
    "entry.1743166598": getVal("i1"),
    "entry.189884999": getVal("Rep1"),
    "entry.164706516": getVal("RIR1"),
    "entry.297841540": getVal("rec1"),
    "entry.1579682820": getVal("kg2"),
    "entry.1209305030": getVal("i2"),
    "entry.676283789": getVal("Rep2"),
    "entry.1940734848": getVal("RIR2"),
    "entry.1689760695": getVal("rec2"),
    "entry.34824846": getVal("kg3"),
    "entry.528917915": getVal("i3"),
    "entry.788505499": getVal("Rep3"),
    "entry.1498087804": getVal("RIR3"),
    "entry.1917477661": getVal("rec3"),
    "entry.910847423": getVal("kg4"),
    "entry.831909719": getVal("i4"),
    "entry.1951974537": getVal("Rep4"),
    "entry.424157927": getVal("RIR4"),
    "entry.1976325897": getVal("rec4"),
    "entry.2004267982": getVal("kg5"),
    "entry.207883616": getVal("i5"),
    "entry.1594603315": getVal("Rep5"),
    "entry.1303875824": getVal("RIR5"),
    "entry.1101581192": getVal("rec5"),
    "entry.1166189654": getVal("kg6"),
    "entry.1135214150": getVal("i6"),
    "entry.1557441991": getVal("Rep6"),
    "entry.301613450": getVal("RIR6"),
    "entry.490439673": getVal("rec6"),
    "entry.636191433": getVal("textBox1"),
    "entry.1607583138": getVal("rm1"),
    "entry.337634217": getVal("rm2"),
    "entry.975920808": getVal("rm3"),
    "entry.810637765": getVal("rm4"),
    "entry.30846413": getVal("rm5"),
    "entry.408397467": getVal("rm6")
  });

  // Genera el enlace completo con todas las respuestas inyectadas
  const enlaceGenerado = `${BASE_FORM_URL}?${params.toString()}`;

  // Opciones: puedes abrirlo automáticamente en una pestaña nueva o mostrarlo
  window.open(enlaceGenerado, "_blank");
  
  // O si prefieres que se cree un botón o alerta con el enlace:
  console.log("Enlace generado:", enlaceGenerado);
}
 
function consultarEntrenamientos() {
  const scriptUrl = TinyDB.getValue("script");
  const usuario = encodeURIComponent(TinyDB.getValue("Usuario"));
  const dateEnc = encodeURIComponent(fecha);
  const ejEnc = encodeURIComponent(document.getElementById("ejercicio").value);

  const payload = `tipo=entrenamientoFuerza&usuario=${usuario}&date=${dateEnc}&listpicker=${ejEnc}`;

  if (!scriptUrl) {
    alert("La URL de Apps Script no está configurada en TinyDB ('script').");
    return;
  }

  fetch(scriptUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: payload
  })
  .then(response => response.text())
  .then(data => {
    calendar = 0;
    let partes = data.split("|||");
    textosNavegacion = [
      partes[0] || "",
      partes[1] || "",
      partes[2] || ""
    ];
    currentTextIndex = 0;
    actualizarTextoNavegacion();
  })
  .catch(err => {
    console.error("Error al consultar:", err);
    alert("Error de red al consultar. Revisa la consola.");
  });
}

function finalizarEntrenamiento() {
  last = "Fuerza";
  TinyDB.storeValue("Last", last);
  window.location.href = "RPE.html";
}

function actualizarEstadosFilas() {
  const vbtEl = document.getElementById("vbt");
  const isVBTOn = vbtEl && vbtEl.checked;

  for (let i = 1; i <= 6; i++) {
    const chk = document.getElementById(`s${i}`);
    const row = document.getElementById(`serie_row_${i}`);
    
    const filaAnteriorOn = (i > 1 && document.getElementById(`s${i - 1}`).checked);
    const esActiva = (i === 1 || filaAnteriorOn);

    if (esActiva) {
      if (chk) chk.disabled = false;
      if (row) row.classList.remove("disabled");

      const isOn = chk && chk.checked;
      
      ["kg", "Rep", "RIR", "rec"].forEach(prefix => {
        const inputEl = document.getElementById(`${prefix}${i}`);
        if (inputEl) {
          inputEl.disabled = !isOn;
          if (!isOn) {
            inputEl.value = "";
            inputEl.classList.add("disabled-input");
          } else {
            inputEl.classList.remove("disabled-input");
          }
        }
      });

      const inputRM = document.getElementById(`rm${i}`);
      if (inputRM) {
        inputRM.disabled = !isOn;
        inputRM.readOnly = true;
        if (!isOn) inputRM.value = "";
        inputRM.classList.add("disabled-input");
      }

      const inputI = document.getElementById(`i${i}`);
      if (inputI) {
        inputI.disabled = !isOn;
        if (!isOn) {
          inputI.value = "";
          inputI.classList.add("disabled-input");
        } else {
          if (isVBTOn) {
            inputI.readOnly = false;
            inputI.classList.remove("disabled-input");
          } else {
            inputI.readOnly = true;
            inputI.classList.add("disabled-input");
            calcularIntensidadAutomatica(i);
          }
        }
      }

      const inputRIR = document.getElementById(`RIR${i}`);
      if (inputRIR) {
        inputRIR.disabled = !isOn;
        if (!isOn) {
          inputRIR.value = "";
          inputRIR.classList.add("disabled-input");
        } else {
          if (!isVBTOn) {
            inputRIR.readOnly = false;
            inputRIR.classList.remove("disabled-input");
          } else {
            inputRIR.classList.remove("disabled-input");
          }
        }
      }

    } else {
      if (chk) {
        chk.disabled = true;
        chk.checked = false;
      }
      if (row) row.classList.add("disabled");
      
      ["kg", "i", "Rep", "RIR", "rec", "rm"].forEach(prefix => {
        const inputEl = document.getElementById(`${prefix}${i}`);
        if (inputEl) {
          inputEl.disabled = true;
          inputEl.value = "";
          inputEl.classList.add("disabled-input");
        }
      });
    }
  }
}

function manejadorCambioSerie(numSerie, isOn) {
  if (isOn) {
    if (numSerie > 1) {
      const kgAnterior = getVal(`kg${numSerie - 1}`);
      setVal(`kg${numSerie}`, kgAnterior);
    }
    inicio = Date.now();
    iniciarCronometro();
    calcularRM(numSerie);
  } else {
    for (let i = numSerie; i <= 6; i++) {
      if (i > numSerie) {
        const switchEl = document.getElementById(`s${i}`);
        if (switchEl) switchEl.checked = false;
      }
      ["kg", "i", "Rep", "RIR", "rec", "rm"].forEach(prefix => setVal(`${prefix}${i}`, ""));
    }
    actualizarMaximoRM();
  }
  actualizarEstadosFilas();
}

function iniciarCronometro() {
  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    ahora = Date.now();
    const trans = ahora - inicio;
    const mins = Math.floor(trans / 60000);
    const segs = Math.floor((trans % 60000) / 1000);

    document.getElementById("minutos").innerText = mins;
    document.getElementById("segundos").innerText = segs < 10 ? `0${segs}` : segs;
  }, 1000);
}

function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value : "";
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}
