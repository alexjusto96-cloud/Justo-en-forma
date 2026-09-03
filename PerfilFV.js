// Simulación de TinyDB con LocalStorage
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
let web1Url = "";

// Referencias al DOM
const webViewer1 = document.getElementById('webViewer1');
const listPicker1 = document.getElementById('listPicker1');
const textBox11 = document.getElementById('textBox11');
const checkBox1 = document.getElementById('checkBox1');
const button2 = document.getElementById('button2');
const mejorText = document.getElementById('mejorText');
const r2Text = document.getElementById('r2Text');

// 1. Inicialización
document.addEventListener('DOMContentLoaded', () => {
  web1Url = TinyDB1.getValue('script', '');
  webViewer1.classList.add('hidden');

  globalJson = TinyDB1.getValue('Usuario', '');

  const today = new Date();
  globalDate = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

  const ejercicios = TinyDB1.getValue('Ejercicio', []);
  listPicker1.innerHTML = '<option value="" disabled selected>Elige un ejercicio</option>';

  if (Array.isArray(ejercicios)) {
    ejercicios.forEach(ejercicio => {
      const option = document.createElement('option');
      option.value = ejercicio;
      option.textContent = ejercicio;
      listPicker1.appendChild(option);
    });
  }
});

// 2. Selección de ejercicio
listPicker1.addEventListener('change', () => {
  textBox11.value = listPicker1.value;
});

// 3. Procesar respuesta de Web1
function handleWeb1GotText(responseContent) {
  let cleanText = responseContent
    .replace(/\{/g, '')
    .replace(/\}/g, '')
    .replace(/"/g, '')
    .replace(/\[/g, '')
    .replace(/\]/g, '');

  globalJson = cleanText;

  mejorText.textContent = cleanText.substring(8, 19);

  globalLongitud = cleanText.length;
  const startIndex = globalLongitud - 4;
  r2Text.textContent = cleanText.substring(startIndex, startIndex + 4);
}

// 4. Guardar datos
button2.addEventListener('click', () => {
  const selectedExercise = textBox11.value;
  const textoMejor = mejorText.textContent.trim();
  const textoR2 = r2Text.textContent.trim();
  const isChecked = checkBox1.checked;

  if (isChecked) {
    const web3Url = `https://docs.google.com/forms/d/1JWWKvqlswNXFEhOzJOtEMl_zLwhFx0Ek2IcpQKb8dWs/formResponse?` +
      `entry.421504529=${encodeURIComponent(globalJson)}&` +
      `entry.1295778689=${encodeURIComponent(globalDate)}&` +
      `entry.758645353=${encodeURIComponent(selectedExercise)}&` +
      `entry.610994258=${encodeURIComponent(textoR2)}`;

    fetch(web3Url, { mode: 'no-cors' }).catch(err => console.error("Error Web3:", err));
  }

  const cargasValidas = ["Cargas 1234", "Cargas 1235", "Cargas 1245", "Cargas 1345"];

  if (cargasValidas.includes(textoMejor)) {
    const siNoText = isChecked ? "Sí" : "No";

    const tb1 = document.getElementById('textBox1')?.value || '';
    const tb2 = document.getElementById('textBox2')?.value || '';
    const tb3 = document.getElementById('textBox3')?.value || '';
    const tb4 = document.getElementById('textBox4')?.value || '';
    const tb5 = document.getElementById('textBox5')?.value || '';
    const tb6 = document.getElementById('textBox6')?.value || '';
    const tb7 = document.getElementById('textBox7')?.value || '';
    const tb8 = document.getElementById('textBox8')?.value || '';
    const tb9 = document.getElementById('textBox9')?.value || '';
    const tb10 = document.getElementById('textBox10')?.value || '';

    let web2Url = `https://docs.google.com/forms/d/1Cjq-HmSeD7VNo0mklVg4DZhP5gM2bYWG7CmSFfTaEQo/formResponse?` +
      `entry.1102825381=${encodeURIComponent(globalJson)}&` +
      `entry.1584449220=${encodeURIComponent(globalDate)}&` +
      `entry.1565535137=${encodeURIComponent(selectedExercise)}&` +
      `entry.1203760941=${encodeURIComponent(tb2)}&` +
      `entry.562972705=${encodeURIComponent(tb1)}&` +
      `entry.1596773769=${encodeURIComponent(tb4)}&` +
      `entry.1615215809=${encodeURIComponent(tb3)}&` +
      `entry.1586228761=${encodeURIComponent(textoMejor === "Cargas 1235" || textoMejor === "Cargas 1245" ? (tb8 || tb6) : tb6)}&` +
      `entry.777431361=${encodeURIComponent(textoMejor === "Cargas 1235" || textoMejor === "Cargas 1245" ? (tb7 || tb5) : tb5)}&` +
      `entry.614158757=${encodeURIComponent(tb10 || tb8)}&` +
      `entry.1460219012=${encodeURIComponent(tb9 || tb7)}&` +
      `entry.210271129=${encodeURIComponent(siNoText)}&` +
      `entry.472309366=${encodeURIComponent(textoR2)}`;

    fetch(web2Url, { mode: 'no-cors' }).catch(err => console.error("Error Web2:", err));
  }
});
