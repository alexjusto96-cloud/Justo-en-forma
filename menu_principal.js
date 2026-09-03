const SCRIPT_BASE = 'https://script.google.com/macros/s/AKfycbyPfGgRmGtJ6R_5P3NA6D7dhbT0CYW0Aw6i053H-F13PpvARKWYdV_MLxtymgmglUcd6Q/exec';
const SCRIPT_CATALOGOS = 'https://script.google.com/macros/s/AKfycbz12fwGML23SoaowYE1m_emFaa6DSThu8ql1PX4HneMRbUjtLDR6GvYXBqcSGZ3LtaZ/exec';

document.addEventListener('DOMContentLoaded', async () => {
  // Mantener la URL del script base original para envíos/consultas de la app
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

  // --- PRECARGA DE DATOS (Usa únicamente SCRIPT_CATALOGOS) ---
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
 * Peticiones asíncronas concurrentes usando SCRIPT_CATALOGOS exclusivamente para descargar listas
 */
async function cargarCatalogos(usuario) {
  const nombreEnc = encodeURIComponent(usuario);

  await Promise.all([
    // 1. Ejercicios
    fetchData(`${SCRIPT_CATALOGOS}?nombre=${nombreEnc}&seccion=Ejercicios`, 'Ejercicio'),

    // 2. Tipo de Carrera
    fetchData(`${SCRIPT_CATALOGOS}?nombre=${nombreEnc}&seccion=TipoDeCarrera`, 'Carrera'),

    // 3. Tipo de Ciclismo
    fetchData(`${SCRIPT_CATALOGOS}?nombre=${nombreEnc}&seccion=TipoDeCiclismo`, 'Ciclismo'),

    // 4. Tipo de Test
    fetchData(`${SCRIPT_CATALOGOS}?nombre=${nombreEnc}&seccion=TipoDeTest`, 'Test')
  ]);
}

/**
 * Función genérica para descargar y almacenar datos con gestión de errores y redirecciones
 */
async function fetchData(url, storageKey) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow'
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: status ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('La respuesta del servidor no es un JSON válido');
    }

    const data = await response.json();

    if (data.error) {
      console.warn(`[Apps Script Error] ${storageKey}: ${data.error}`);
      return;
    }

    if (Array.isArray(data.lista)) {
      localStorage.setItem(storageKey, JSON.stringify(data.lista));
      console.log(`✓ ${storageKey} guardado con éxito (${data.lista.length} elementos)`);
    } else {
      localStorage.setItem(storageKey, JSON.stringify([]));
      console.warn(`[Aviso] ${storageKey} devolvió una estructura sin lista:`, data);
    }

  } catch (err) {
    console.error(`Error al conectar con la Web App (${storageKey}):`, err);
  }
}
