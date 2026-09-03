const FORM_ACTION_URL = 'https://docs.google.com/forms/d/16n9ccJHJLxOZhlPE7KX5y5tghZ0FTFpLMV7h1NGhyaA/formResponse';

document.addEventListener('DOMContentLoaded', () => {
  const usuario = localStorage.getItem('Usuario') || sessionStorage.getItem('usuarioLogueado');

  if (!usuario) {
    window.location.href = 'index.html';
    return;
  }

  document.getElementById('user-display').textContent = `Usuario: ${usuario}`;

  // Actualizar indicadores numéricos en tiempo real al mover los deslizadores
  setupSlider('soreness', 'val-soreness');
  setupSlider('fatiga', 'val-fatiga');
  setupSlider('sueno', 'val-sueno');
  setupSlider('estres', 'val-estres');

  // Botón Atrás
  document.getElementById('btn-atras').addEventListener('click', () => {
    window.location.href = 'menu_principal.html';
  });

  // Envío del formulario
  document.getElementById('readiness-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('btn-enviar');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    const soreness = document.getElementById('soreness').value;
    const fatiga = document.getElementById('fatiga').value;
    const sueno = document.getElementById('sueno').value;
    const estres = document.getElementById('estres').value;
    const horas = document.getElementById('horas').value;
    const hrv = document.getElementById('hrv').value;
    const peso = document.getElementById('peso').value;
    const observaciones = document.getElementById('observaciones').value;

    // Construir los parámetros codificados exactamente igual que en App Inventor
    const params = new URLSearchParams({
      'entry.1796953843': usuario,
      'entry.2042151343': soreness,
      'entry.1747390100': fatiga,
      'entry.54922584': sueno,
      'entry.2019749365': estres,
      'entry.1866528932': horas,
      'entry.691415070': hrv,
      'entry.2041644075': peso,
      'entry.782871966': observaciones
    });

    const targetUrl = `${FORM_ACTION_URL}?${params.toString()}`;

    try {
      // mode: 'no-cors' para permitir peticiones directas a Google Forms desde el navegador
      await fetch(targetUrl, { mode: 'no-cors' });
    } catch (err) {
      console.error('Error al enviar respuestas:', err);
    } finally {
      window.location.href = 'menu_principal.html';
    }
  });
});

function setupSlider(inputId, valId) {
  const input = document.getElementById(inputId);
  const val = document.getElementById(valId);
  input.addEventListener('input', () => {
    val.textContent = input.value;
  });
}
