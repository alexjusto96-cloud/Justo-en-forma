const SCRIPT_BASE = 'https://script.google.com/macros/s/AKfycbyPfGgRmGtJ6R_5P3NA6D7dhbT0CYW0Aw6i053H-F13PpvARKWYdV_MLxtymgmglUcd6Q/exec';
const SCRIPT_EJERCICIOS = 'https://script.google.com/macros/s/AKfycbz5_n-8lvdLQkslE50sveRQY1qoN7jcIS2AoRxJgWBTMCJdyZg4ccV5KrzrDjJ50PiCEA/exec';

document.addEventListener('DOMContentLoaded', () => {
  // Guardar URL del script en localStorage (equivalente a TinyDB key 'script')
  localStorage.setItem('script', SCRIPT_BASE);

  // Obtener usuario activo
  const usuario = localStorage.getItem('Usuario') || sessionStorage.getItem('usuarioLogueado');

  // Si no hay usuario registrado, redirigir al Login
  if (!usuario) {
    window.location.href = 'index.html';
    return;
  }

  // Mostrar el nombre de usuario
  document.getElementById('user-greeting').textContent = `Usuario: ${usuario}`;

  // --- PRECARGA DE DATOS (Equivalente a Web1, Web2, Web3, Web4 .Get) ---
  cargarCatalogos(usuario);

  // --- NAVEGACIÓN Y EVENTOS DE BOTONES ---
  document.getElementById('btn-rpe').addEventListener('click', () => {
    const last = localStorage.getItem('last') || '';
    localStorage.setItem('Last', last);
    window.location.href = 'rpe.html';
  });

  document.getElementById('btn-readiness').addEventListener('click', () => {
    window.location.href = 'readiness.html'; // Corresponde a Screen2
  });

  document.getElementById('btn-perfil-fv').addEventListener('click', () => {
    window.location.href = 'PerfilFV.html'; // Corresponde a PerfilFV
  });

  document.getElementById('btn-performance').addEventListener('click', () => {
    window.location.href = 'Performance.html';
  });

  document.getElementById('btn-consultar-performance').addEventListener('click', () => {
    window.location.href = 'Consulta.html'; // Corresponde a Consulta
  });

  document.getElementById('btn-entrenamiento-fuerza').addEventListener('click', () => {
    window.location.href = 'EntrenamientoFurza.html';
  });

  document.getElementById('btn-registrar-test').addEventListener('click', () => {
    window.location.href = 'Test_registro.html';
  });

  document.getElementById('btn-consultar-test').addEventListener('click', () => {
    window.location.href = 'Test_consulta.html';
  });

  // LogOut
  document.getElementById('btn-logout').addEventListener('click', () => {
    sessionStorage.removeItem('usuarioLogueado');
    window.location.href = 'index.html';
  });
});

/**
 * Peticiones asíncronas para precargar Ejercicios, Carrera, Ciclismo y Test
 */
async function cargarCatalogos(usuario) {
  const nombreEnc = encodeURIComponent(usuario);

  // 1. Ejercicios (Web1)
  fetchData(`${SCRIPT_EJERCICIOS}?nombre=${nombreEnc}&seccion=Ejercicios`, 'Ejercicio');

  // 2. Tipo de Carrera (Web2)
  fetchData(`${SCRIPT_BASE}?nombre=${nombreEnc}&seccion=TipoDeCarrera`, 'Carrera');

  // 3. Tipo de Ciclismo (Web3)
  fetchData(`${SCRIPT_BASE}?nombre=${nombreEnc}&seccion=TipoDeCiclismo`, 'Ciclismo');

  // 4. Tipo de Test (Web4)
  fetchData(`${SCRIPT_BASE}?nombre=${nombreEnc}&seccion=TipoDeTest`, 'Test');
}

async function fetchData(url, storageKey) {
  try {
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      const lista = data.lista || [];
      localStorage.setItem(storageKey, JSON.stringify(lista));
    }
  } catch (err) {
    console.error(`Error al cargar ${storageKey}:`, err);
  }
}
