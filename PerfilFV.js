// LocalStorage simula TinyDB
const TinyDB1 = {
  getValue: function(key, notFoundValue) {
    const val = localStorage.getItem(key);
    return val !== null ? JSON.parse(val) : notFoundValue;
  }
};

// Variables globales
let globalJson = "";
let globalDate = "";
let globalLongitud = 0;

// Referencias a elementos del DOM
const webViewer1 = document.getElementById('webViewer1');
const listPicker1 = document.getElementById('listPicker1');
const textBox11 = document.getElementById('textBox11');
const checkBox1 = document.getElementById('checkBox1');
const button2 = document.getElementById('button2');
const mejorText = document.getElementById('mejorText');
const r2Text = document.getElementById('r2Text');

let web1Url = "";

// 1. Evento Initialize (PerfilFV.Initialize)[cite: 11]
document.addEventListener('DOMContentLoaded', () => {
  // Configurar Web1.Url desde TinyDB[cite: 11]
  web1Url = TinyDB1.getValue('script', '');

  // Ocultar WebViewer1[cite: 11]
  webViewer1.classList.add('hidden');

  // Obtener global json[cite: 11]
  globalJson = TinyDB1.getValue('Usuario', '');

  // Formatear global date como YYYY-M-D[cite: 11]
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  globalDate = `${year}-${month}-${day}`;

  // Cargar elementos en el selector desde TinyDB[cite: 11]
  const ejercicios = TinyDB1.getValue('Ejercicio', []);
  listPicker1.innerHTML = '<option value="" disabled selected>Elige un ejercicio</option>';
  ejercicios.forEach(ejercicio => {
    const option = document.createElement('option');
    option.value = ejercicio;
    option.textContent = ejercicio;
    listPicker1.appendChild(option);
  });
});

// 2. Evento ListPicker (ListPicker1.AfterPicking)[cite: 11]
listPicker1.addEventListener('change', () => {
  const selectedValue = listPicker1.value;
  textBox11.value = selectedValue;
});

// 3. Procesar respuesta de Web1 (Web1.GotText)[cite: 11]
function handleWeb1GotText(responseContent) {
  // Limpieza de caracteres de formato JSON/Texto[cite: 11]
  let cleanText = responseContent
    .replace(/\[/g, '')
    .replace(/\]/g, '')
    .replace(/\{/g, '')
    .replace(/\}/g, '')
    .replace(/"/g, '');

  // Extraer subcadenas para 'Mejor' y 'R2'[cite: 11]
  const mejor = cleanText.substring(0, 10);
  const r2 = cleanText.substring(10, 20);

  mejorText.textContent = mejor;
  r2Text.textContent = r2;

  // Registrar longitud del texto procesado[cite: 11]
  globalLongitud = cleanText.length;
}

// 4. Envío de formularios (Button2.Click)[cite: 11]
button2.addEventListener('click', () => {
  const selectedExercise = textBox11.value;

  // Comprobación de CheckBox1 para Web3[cite: 11]
  if (checkBox1.checked) {
    const web3Url = `https://docs.google.com/forms/d/e/.../formResponse?` +
      `entry.1111111=${encodeURIComponent(globalJson)}&` +
      `entry.2222222=${encodeURIComponent(globalDate)}&` +
      `entry.3333333=${encodeURIComponent(selectedExercise)}&` +
      `entry.4444444=${encodeURIComponent(r2Text.textContent)}`;

    fetch(web3Url, { mode: 'no-cors' });
  }

  // Lógica de variaciones de 'Mejor' para Web2[cite: 11]
  const textoMejor = mejorText.textContent;

  if (textoMejor.includes("Cargas 1234") || 
      textoMejor.includes("Cargas 1235") || 
      textoMejor.includes("Cargas 1245") || 
      textoMejor.includes("Cargas 1345")) {

    if (checkBox1.checked) {
      const web2Url = `https://docs.google.com/forms/d/e/.../formResponse?` +
        `entry.5555555=${encodeURIComponent(globalJson)}&` +
        `entry.6666666=${encodeURIComponent(globalDate)}&` +
        `entry.7777777=${encodeURIComponent(selectedExercise)}&` +
        `entry.8888888=${encodeURIComponent(textoMejor)}`;

      fetch(web2Url, { mode: 'no-cors' });
    }
  }
});
