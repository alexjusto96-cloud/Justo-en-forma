const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzgbpLHMn55sle1dFFnh8SZLZFm4Ds7Dk3c6HirfdAUf8_iu-CAP6wpqAuwGaJDcNBH6A/exec';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const usuarioInput = document.getElementById('usuario');
  const passwordInput = document.getElementById('password');
  const rememberCheckbox = document.getElementById('remember-me');
  const submitBtn = document.getElementById('btn-enviar');
  const notification = document.getElementById('notification');

  // --- EQUIVALENTE A: Screen1.Initialize ---
  // Cargar credenciales si estaban guardadas previamente (TinyDB "check")
  try {
    const savedCheck = JSON.parse(localStorage.getItem('check'));
    if (savedCheck && savedCheck.Usuario) {
      usuarioInput.value = savedCheck.Usuario || '';
      passwordInput.value = savedCheck.Contraseña || '';
      rememberCheckbox.checked = true;
    } else {
      rememberCheckbox.checked = false;
    }
  } catch (e) {
    console.error('Error al leer credenciales locales:', e);
    rememberCheckbox.checked = false;
  }

  // --- EQUIVALENTE A: Enviar.Click ---
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const usuario = usuarioInput.value.trim();
    const password = passwordInput.value.trim();
    const isChecked = rememberCheckbox.checked;

    if (!usuario || !password) return;

    // Deshabilitar botón durante la consulta
    submitBtn.disabled = true;
    submitBtn.textContent = 'Verificando...';
    hideNotification();

    // Guardar usuario actual
    localStorage.setItem('Usuario', usuario);

    // Guardar o borrar credenciales según "Recuérdame"
    if (isChecked) {
      localStorage.setItem('check', JSON.stringify({
        Usuario: usuario,
        Contraseña: password
      }));
    } else {
      localStorage.setItem('check', JSON.stringify({
        Usuario: '',
        Contraseña: ''
      }));
    }

    // --- CONSULTA A GOOGLE APPS SCRIPT ---
    try {
      const response = await fetch(`${SCRIPT_URL}?accion=consultar&num=${encodeURIComponent(usuario)}`);
      
      if (!response.ok) {
        throw new Error('Error en la comunicación con el servidor');
      }

      const data = await response.json();
      
      // --- EQUIVALENTE A: Web1.GotText ---
      // Forzar la conversión a String para asegurar compatibilidad con contraseñas puramente numéricas
      const dbPassword = (data && data.length > 0 && data[0].columna2 !== undefined && data[0].columna2 !== null)
        ? String(data[0].columna2).trim()
        : null;

      if (dbPassword !== null && dbPassword === password) {
        // Almacenar el usuario en la sesión
        sessionStorage.setItem('usuarioLogueado', usuario);
        
        // Redirigir al menú principal
        window.location.href = 'menu_principal.html';
      } else {
        // Equivalente a: Notificador1.ShowAlert("Verifica tus credenciales")
        showNotification('Verifica tus credenciales', 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('Error de conexión o al procesar la respuesta', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Enviar';
    }
  });

  function showNotification(msg, type) {
    notification.textContent = msg;
    notification.className = `notification ${type}`;
  }

  function hideNotification() {
    notification.className = 'notification hidden';
  }
});
