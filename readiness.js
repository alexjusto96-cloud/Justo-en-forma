const FORM_ACTION_URL = 'https://docs.google.com/forms/d/16n9ccJHJLxOZhlPE7KX5y5tghZ0FTFpLMV7h1NGhyaA/formResponse';

document.addEventListener('DOMContentLoaded', () => {
  // Inyectar estilos indispensables para sliders y botones táctiles
  const style = document.createElement('style');
  style.textContent = `
    input[type="range"].mobile-slider {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      height: 12px;
      border-radius: 6px;
      outline: none;
      margin: 10px 0;
      cursor: pointer;
    }
    input[type="range"].mobile-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: #ffffff;
      border: 2px solid #0f172a;
      box-shadow: 0 2px 6px rgba(0,0,0,0.25);
      cursor: pointer;
    }
    input[type="range"].mobile-slider::-moz-range-thumb {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: #ffffff;
      border: 2px solid #0f172a;
      box-shadow: 0 2px 6px rgba(0,0,0,0.25);
      cursor: pointer;
    }
  `;
  document.head.appendChild(style);

  // Obtener usuario exactamente como se guarda en TinyDB (APK original)
  const usuario = localStorage.getItem('Usuario') || sessionStorage.getItem('Usuario') || localStorage.getItem('usuarioLogueado');

  if (!usuario) {
    window.location.href = 'index.html';
    return;
  }

  document.getElementById('user-display').textContent = `Usuario: ${usuario}`;

  // Configurar sliders con degradado dinámico y contadores
  const sliders = document.querySelectorAll('input[type="range"]');
  sliders.forEach(slider => {
    updateSlider(slider);
    slider.addEventListener('input', (e) => updateSlider(e.target));
  });

  // Evento Botón Atrás
  document.getElementById('btn-atras').addEventListener('click', () => {
    window.location.href = 'menu_principal.html';
  });

  // Envío del Formulario asegurando la recepción en Google Forms
  document.getElementById('readiness-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('btn-enviar');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    // 1. Crear un iframe oculto para procesar el envío sin problemas de CORS ni redirección inmediata
    let iframe = document.getElementById('hidden_iframe');
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.name = 'hidden_iframe';
      iframe.id = 'hidden_iframe';
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
    }

    // 2. Crear un formulario invisible para enviar mediante POST a Google Forms (Mismo mapeo de entradas de la APK)
    const googleForm = document.createElement('form');
    googleForm.action = FORM_ACTION_URL;
    googleForm.method = 'POST';
    googleForm.target = 'hidden_iframe';

    const fields = {
      'entry.1796953843': usuario,
      'entry.2042151343': document.getElementById('soreness').value,
      'entry.1747390100': document.getElementById('fatiga').value,
      'entry.54922584': document.getElementById('sueno').value,
      'entry.2019749365': document.getElementById('estres').value,
      'entry.1866528932': document.getElementById('horas').value || '',
      'entry.691415070': document.getElementById('hrv').value || '',
      'entry.2041644075': document.getElementById('peso').value || '',
      'entry.782871966': document.getElementById('observaciones').value || ''
    };

    for (const key in fields) {
      const hiddenInput = document.createElement('input');
      hiddenInput.type = 'hidden';
      hiddenInput.name = key;
      hiddenInput.value = fields[key];
      googleForm.appendChild(hiddenInput);
    }

    document.body.appendChild(googleForm);
    googleForm.submit();

    // 3. Dar margen de tiempo para completar la petición antes de cambiar de pantalla
    setTimeout(() => {
      document.body.removeChild(googleForm);
      window.location.href = 'menu_principal.html';
    }, 800);
  });
});

function updateSlider(slider) {
  const valSpan = document.getElementById(`val-${slider.id}`);
  if (valSpan) {
    valSpan.textContent = slider.value;
  }

  const isGoodRight = slider.getAttribute('data-type') === 'good-right';
  if (isGoodRight) {
    slider.style.background = 'linear-gradient(to right, #ef4444, #eab308, #22c55e)';
  } else {
    slider.style.background = 'linear-gradient(to right, #22c55e, #eab308, #ef4444)';
  }
}
