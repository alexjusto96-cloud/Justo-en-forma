document.addEventListener('DOMContentLoaded', () => {
    // 1. Obtener usuario activo (coherente con el menú principal)
    const usuario = localStorage.getItem('Usuario') || sessionStorage.getItem('usuarioLogueado');
    if (!usuario) {
        window.location.href = 'index.html';
        return;
    }

    const inputNombre = document.getElementById('nombre');
    inputNombre.value = usuario;

    // 2. Inicializar Fecha actual (Formato YYYY-MM-DD compatible con input type="date")
    const inputFecha = document.getElementById('fecha');
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    inputFecha.value = `${anio}-${mes}-${dia}`;

    // 3. Cargar elementos del Test desde localStorage (precargados en el menú principal)
    const selectTest = document.getElementById('test-select');
    const inputResultadoPre = document.getElementById('resultado-pre');
    const listaTestJSON = localStorage.getItem('Test');
    
    if (listaTestJSON) {
        try {
            const listaTest = JSON.parse(listaTestJSON);
            listaTest.forEach(item => {
                const option = document.createElement('option');
                option.value = item;
                option.textContent = item;
                selectTest.appendChild(option);
            });
        } catch (e) {
            console.error('Error al parsear la lista de Test desde localStorage:', e);
        }
    }

    // Sincronizar la selección del desplegable con el textbox editable (Resultado_PRE)
    selectTest.addEventListener('change', () => {
        inputResultadoPre.value = selectTest.value;
    });

    // 4. Lógica de selección Bilateral / Unilateral (Equivalente al bloque AfterPicking de UniMulti)
    const selectUniMulti = document.getElementById('unimulti');
    const selectLateralidad = document.getElementById('lateralidad');

    selectUniMulti.addEventListener('change', () => {
        const seleccion = selectUniMulti.value;
        if (seleccion === 'Bilateral') {
            selectLateralidad.value = '';
            selectLateralidad.classList.add('hidden');
            selectLateralidad.disabled = true;
            selectTest.disabled = false;
            inputResultadoPre.disabled = false;
        } else if (seleccion === 'Unilateral') {
            selectLateralidad.classList.remove('hidden');
            selectLateralidad.disabled = false;
            selectTest.disabled = false;
            inputResultadoPre.disabled = false;
        }
    });

    // 5. Botón Enviar / Registrar (Equivalente al bloque Click de Enviar)
    const btnEnviar = document.getElementById('enviar');
    const inputResultado = document.getElementById('resultado');
    const inputObservaciones = document.getElementById('observaciones');
    const lblNotificador = document.getElementById('notificador-lbl');

    btnEnviar.addEventListener('click', async () => {
        let hayError = false;

        // Validación de campos obligatorios con marcado visual en rojo
        if (!inputNombre.value.trim()) {
            inputNombre.classList.add('error');
            hayError = true;
        } else {
            inputNombre.classList.remove('error');
        }

        if (!inputFecha.value.trim()) {
            inputFecha.classList.add('error');
            hayError = true;
        } else {
            inputFecha.classList.remove('error');
        }

        if (!inputResultadoPre.value.trim()) {
            inputResultadoPre.classList.add('error');
            hayError = true;
        } else {
            inputResultadoPre.classList.remove('error');
        }

        if (!inputResultado.value.trim()) {
            inputResultado.classList.add('error');
            hayError = true;
        } else {
            inputResultado.classList.remove('error');
        }

        if (hayError) {
            alert('Comprueba los campos obligatorios');
            return;
        }

        // Obtener lateralidad si aplica
        const lateralidadVal = selectUniMulti.value === 'Unilateral' ? selectLateralidad.value : '';
        const testSeleccionado = inputResultadoPre.value; // Se envía el valor del textbox editable

        // Construir URL del Google Form idéntica al bloque App Inventor
        const formID = '1FAIpQLSeRxOtwwOBM4TpviGO3f0WolnSy18VBjjZIe_EY-cvYAnJu_A';
        const urlGoogleForm = `https://docs.google.com/forms/d/e/${formID}/formResponse?` +
            `entry.1605752120=${encodeURIComponent(inputNombre.value)}` +
            `&entry.118908139=${encodeURIComponent(inputFecha.value)}` +
            `&entry.335892241=${encodeURIComponent(testSeleccionado)}` +
            `&entry.1540418146=${encodeURIComponent(lateralidadVal)}` +
            `&entry.1648244417=${encodeURIComponent(inputResultado.value)}` +
            `&entry.1814970791=${encodeURIComponent(inputObservaciones.value)}`;

        try {
            // Envío mediante no-cors debido a restricciones de políticas de Google Forms
            await fetch(urlGoogleForm, {
                method: 'GET',
                mode: 'no-cors'
            });
            lblNotificador.textContent = 'Respuestas enviadas correctamente';
            
            // Limpiar campos numéricos/resultados tras envío exitoso
            inputResultado.value = '';
            inputObservaciones.value = '';
        } catch (err) {
            console.error('Error al enviar los datos:', err);
            alert('Hubo un error al enviar el registro.');
        }
    });

    // 6. Botón Menú Principal
    document.getElementById('btn-menu').addEventListener('click', () => {
        window.location.href = 'menu_principal.html';
    });
});
