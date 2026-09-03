const SCRIPT_BASE = 'https://script.google.com/macros/s/AKfycbyPfGgRmGtJ6R_5P3NA6D7dhbT0CYW0Aw6i053H-F13PpvARKWYdV_MLxtymgmglUcd6Q/exec';
const SCRIPT_EJERCICIOS = 'https://script.google.com/macros/s/AKfycbz5_n-8lvdLQkslE50sveRQY1qoN7jcIS2AoRxJgWBTMCJdyZg4ccV5KrzrDjJ50PiCEA/exec';

document.addEventListener('DOMContentLoaded', async () => {
  // Guardar URL del script base en localStorage (equivalente a TinyDB key 'script')
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

  // --- PRECARGA DE DATOS ---
  await cargarCatalogos(usuario);

  // --- NAVEGACIÓN Y EVENTOS DE BOTONES ---
  document.getElementById('btn-rpe').addEventListener('click', () => {
    const last = localStorage.getItem('last') || '';
    localStorage.setItem('Last', last);
    window.location.href = 'rpe.html';
  });

  document.getElementById('btn-readiness').addEventListener('click', () => {
    window.location.href = 'readiness.html';
  });

  document.getElementById('btn-perfil-fv').addEventListener('click', () => {
    window.location.href = 'PerfilFV.html';
  });

  document.getElementById('btn-performance').addEventListener('click', () => {
    window.location.href = 'Performance.html';
  });

  document.getElementById('btn-consultar-performance').addEventListener('click', () => {
    window.location.href = 'Consulta.html';
  });

  document.getElementById('btn-entrenamiento-fuerza').addEventListener('click', () => {
    window.location.href = 'EntrenamientoFuerza.html';
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
 * Peticiones asíncronas concurrentes para precargar las 4 secciones
 */
async function cargarCatalogos(usuario) {
  const nombreEnc = encodeURIComponent(usuario);

  await Promise.all([
    // 1. Ejercicios (SCRIPT_EJERCICIOS)
    fetchData(`${SCRIPT_EJERCICIOS}?nombre=${nombreEnc}&seccion=Ejercicios`, 'Ejercicio'),

    // 2. Tipo de Carrera (SCRIPT_BASE)
    fetchData(`${SCRIPT_BASE}?nombre=${nombreEnc}&seccion=TipoDeCarrera`, 'Carrera'),

    // 3. Tipo de Ciclismo (SCRIPT_BASE)
    fetchData(`${SCRIPT_BASE}?nombre=${nombreEnc}&seccion=TipoDeCiclismo`, 'Ciclismo'),

    // 4. Tipo de Test (SCRIPT_BASE)
    fetchData(`${SCRIPT_BASE}?nombre=${nombreEnc}&seccion=TipoDeTest`, 'Test')
  ]);
}

/**
 * Función genérica para descargar y almacenar datos con gestión estricta de redirecciones y errores
 */
async function fetchData(url, storageKey) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow' // Sigue la redirección 302 hacia script.googleusercontent.com
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: status ${response.status}`);
    }

    const data = await response.json();

    // Comprobamos si Apps Script mandó una respuesta con error
    if (data.error) {
      console.warn(`[Apps Script Error] ${storageKey}: ${data.error}`);
      return;
    }

    if (Array.isArray(data.lista)) {
      localStorage.setItem(storageKey, JSON.stringify(data.lista));
      console.log(`✓ ${storageKey} guardado con éxito (${data.lista.length} elementos)`);
    } else {
      console.warn(`[Aviso] ${storageKey} devolvió una estructura sin lista:`, data);
    }

  } catch (err) {
    console.error(`Error al conectar con la Web App (${storageKey}):`, err);
  }
}
