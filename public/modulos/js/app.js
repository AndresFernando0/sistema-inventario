const configuracion = {
    personal: {
        tabla: 'personal',
        clave: 'identidad',
        etiqueta: 'Personal',
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
        clave: 'codigo',
        etiqueta: 'Proveedor',
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


    const { data, error } = await window.db
        .from(config.tabla)
        .select(modulo === 'proveedores' ? 'codigo::text,empresa,encargado,telefono,direccion,email' : '*')
        .order(
            modulo === 'personal' ? 'nombres' : 'codigo',
            { ascending: true }
        );

    if (error) {
        console.error('Error al consultar:', error.message);
        notificar('No se pudo actualizar la lista.', 'error');
        return;
    }

    cuerpo.replaceChildren();
    data.forEach(registro => {

        const fila = document.createElement('tr');

        config.columnas.forEach(columna => {

            const celda = document.createElement('td');

            celda.textContent = registro[columna] ?? '';

            fila.appendChild(celda);
        });

        const acciones = document.createElement('div');
        acciones.className = 'acciones-tabla';
        const editar = document.createElement('button');
        editar.className = 'btn-editar';
        editar.textContent = 'Editar';
        editar.addEventListener('click', () => editarDatos(config, registro));
        const eliminar = document.createElement('button');
        eliminar.className = 'btn-eliminar';
        eliminar.textContent = 'Eliminar';
        eliminar.addEventListener('click', () => eliminarDatos(modulo, registro));
        acciones.append(editar, eliminar);
        fila.insertCell().appendChild(acciones);
        cuerpo.appendChild(fila);
    });
}

let claveEnEdicion = null;

function notificar(texto, tipo) {
    const aviso = document.createElement('div');
    aviso.className = 'notificacion ' + tipo;
    aviso.textContent = texto;
    document.getElementById('notificaciones').appendChild(aviso);
    setTimeout(() => aviso.remove(), 4500);
}

function editarDatos(config, registro) {
    const formulario = document.getElementById(config.formulario);
    formulario.reset();
    claveEnEdicion = registro ? registro[config.clave] : null;
    if (registro) {
        for (const campo of formulario.elements) {
            if (campo.name) campo.value = registro[campo.name] ?? '';
        }
    }
    if (formulario.elements.identidad) formulario.elements.identidad.readOnly = !!registro;
    document.getElementById('tituloFormulario').textContent = (registro ? 'Editar ' : 'Registrar ') + config.etiqueta;
    formulario.querySelector('[type="submit"]').textContent = registro ? 'Guardar cambios' : 'Guardar ' + config.etiqueta;
    document.getElementById('cancelarEdicion').hidden = !registro;
    if (registro) formulario.querySelector('input:not([readonly])').focus();
}

async function eliminarDatos(modulo, registro) {
    const config = configuracion[modulo];
    const clave = registro[config.clave];
    if (!window.confirm('Eliminar ' + config.etiqueta + ' (' + clave + ')?')) return;
    const main = document.querySelector('main');
    main.inert = true;
    try {
        const { error } = await window.db.from(config.tabla).delete()
            .eq(config.clave, clave).select(config.clave).single();
        if (error) throw error;
        if (claveEnEdicion === clave) editarDatos(config, null);
        notificar('Registro eliminado.', 'exito');
        await listarDatos(modulo);
    } catch {
        notificar('No se pudo eliminar el registro.', 'error');
    } finally {
        main.inert = false;
    }
}

async function guardarDatos(event, modulo) {
    event.preventDefault();
    const formulario = event.currentTarget;
    const config = configuracion[modulo];
    const datos = Object.fromEntries(new FormData(formulario).entries());
    const editando = claveEnEdicion !== null;
    const main = document.querySelector('main');
    main.inert = true;
    try {
        const tabla = window.db.from(config.tabla);
        let resultado;
        if (editando) {
            delete datos[config.clave];
            resultado = await tabla.update(datos).eq(config.clave, claveEnEdicion).select(config.clave).single();
        } else {
            resultado = await tabla.insert([datos]);
        }
        if (resultado.error) throw resultado.error;
        editarDatos(config, null);
        notificar(editando ? 'Cambios guardados.' : 'Registro guardado.', 'exito');
        await listarDatos(modulo);
    } catch {
        notificar('No se pudo guardar el registro. Revisa los datos.', 'error');
    } finally {
        main.inert = false;
    }
}

document.addEventListener('sesion-validada', () => {
    Object.keys(configuracion).forEach(modulo => {

        const formulario = document.getElementById(
            configuracion[modulo].formulario
        );

        if (formulario) {

            document.getElementById("cancelarEdicion").addEventListener("click", () => editarDatos(configuracion[modulo], null));
            formulario.addEventListener('submit', event => {
                guardarDatos(event, modulo);
            });

            listarDatos(modulo);
        }

    });
}, { once: true });
