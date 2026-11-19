const configuracion = {
    personal: {
        tabla: 'personal',
        formulario: 'personalForm',
        cuerpo: 'personalTabla',
        columnas: [
            'identidad',
            'nombres',
            'apellidos',
            'genero',
            'telefono',
            'direccion'
        ]
    },

    proveedores: {
        tabla: 'proveedores',
        formulario: 'proveedoresForm',
        cuerpo: 'proveedoresTabla',
        columnas: [
            'codigo',
            'empresa',
            'encargado',
            'telefono',
            'direccion',
            'email'
        ]
    }
};

async function listarDatos(modulo) {

    const config = configuracion[modulo];

    const cuerpo = document.getElementById(config.cuerpo);

    cuerpo.replaceChildren();

    const { data, error } = await window.db
        .from(config.tabla)
        .select('*')
        .order(
            modulo === 'personal' ? 'nombres' : 'codigo',
            { ascending: true }
        );

    if (error) {
        console.error('Error al consultar:', error.message);
        alert('No se pudieron cargar los registros.');
        return;
    }

    data.forEach(registro => {

        const fila = document.createElement('tr');

        config.columnas.forEach(columna => {

            const celda = document.createElement('td');

            celda.textContent = registro[columna] ?? '';

            fila.appendChild(celda);
        });

        cuerpo.appendChild(fila);
    });
}

async function guardarDatos(event, modulo) {

    event.preventDefault();

    const formulario = event.currentTarget;

    const boton = formulario.querySelector('button[type="submit"]');

    const config = configuracion[modulo];

    const datos = Object.fromEntries(
        new FormData(formulario).entries()
    );

    boton.disabled = true;
    boton.textContent = 'Guardando...';

    const { error } = await window.db
        .from(config.tabla)
        .insert([datos]);

    boton.disabled = false;
    boton.textContent = modulo === 'personal'
        ? 'Guardar Personal'
        : 'Guardar Proveedor';

    if (error) {
        console.error('Error al guardar:', error.message);
        alert('No se pudo guardar el registro. Revisa los datos e intenta de nuevo.');
        return;
    }

    alert('Registro guardado correctamente.');

    formulario.reset();

    await listarDatos(modulo);
}

document.addEventListener('sesion-validada', () => {
    Object.keys(configuracion).forEach(modulo => {

        const formulario = document.getElementById(
            configuracion[modulo].formulario
        );

        if (formulario) {

            formulario.addEventListener('submit', event => {
                guardarDatos(event, modulo);
            });

            listarDatos(modulo);
        }

    });
}, { once: true });
