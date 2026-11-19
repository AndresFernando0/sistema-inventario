
import { supabase } from './supabase.js';

// ==========================================
// CONFIGURACIÓN DE LOS MÓDULOS
// ==========================================

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
            'representante',
            'telefono',
            'direccion',
            'correo'
        ]
    }
};

// ==========================================
// FUNCIÓN PARA MOSTRAR LOS REGISTROS
// ==========================================

async function listarDatos(modulo) {

    const config = configuracion[modulo];

    const cuerpo = document.getElementById(config.cuerpo);

    cuerpo.replaceChildren();

    const { data, error } = await supabase
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

// ==========================================
// FUNCIÓN PARA GUARDAR INFORMACIÓN
// ==========================================

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

    const { error } = await supabase
        .from(config.tabla)
        .insert([datos]);

    boton.disabled = false;
    boton.textContent = modulo === 'personal'
        ? 'Guardar Personal'
        : 'Guardar Proveedor';

    if (error) {
        console.error('Error al guardar:', error.message);
        alert('Error al guardar: ' + error.message);
        return;
    }

    alert('Registro guardado correctamente.');

    formulario.reset();

    // Actualizar la tabla automáticamente
    await listarDatos(modulo);
}

// ==========================================
// INICIALIZAR LOS FORMULARIOS
// ==========================================

Object.keys(configuracion).forEach(modulo => {

    const formulario = document.getElementById(
        configuracion[modulo].formulario
    );

    if (formulario) {

        formulario.addEventListener('submit', event => {
            guardarDatos(event, modulo);
        });

        // Cargar registros al abrir la página
        listarDatos(modulo);
    }

});
