const campo = id => document.getElementById(id);
const formulario = campo('productoForm');
const limiteStockBajo = 5;
let productos = [];
let productoAEliminar = null;

function mostrarNotificacion(mensaje, tipo = 'info') {
    const aviso = document.createElement('div');
    aviso.className = 'notificacion ' + tipo;
    aviso.textContent = mensaje;
    campo('contenedorNotificaciones').appendChild(aviso);
    setTimeout(() => aviso.remove(), 4500);
}

function reiniciarFormulario() {
    formulario.reset();
    campo('productoId').value = '';
    campo('tituloFormulario').textContent = 'Registrar Producto';
    campo('btnGuardar').textContent = 'Guardar Producto';
    campo('btnCancelar').hidden = true;
}

function editarProducto(producto) {
    campo('productoId').value = producto.id;
    campo('codigo').value = producto.id;
    for (const nombre of ['nombre', 'descripcion', 'precio', 'stock']) {
        campo(nombre).value = producto[nombre] ?? '';
    }
    const categoria = campo('categoria');
    if (producto.categoria && !Array.from(categoria.options).some(opcion => opcion.value === producto.categoria)) {
        categoria.add(new Option(producto.categoria, producto.categoria));
    }
    categoria.value = producto.categoria ?? '';
    campo('tituloFormulario').textContent = 'Editar Producto';
    campo('btnGuardar').textContent = 'Guardar cambios';
    campo('btnCancelar').hidden = false;
    campo('nombre').focus();
}

function mostrarProductos() {
    const filtro = campo('buscarProducto').value.trim().toLowerCase();
    const tabla = campo('inventarioTabla');
    tabla.replaceChildren();
    for (const producto of productos) {
        const datos = [producto.id, producto.nombre, producto.descripcion, producto.categoria];
        if (!datos.some(valor => String(valor ?? '').toLowerCase().includes(filtro))) continue;

        const fila = tabla.insertRow();
        for (const valor of [producto.id, producto.descripcion, producto.nombre, producto.categoria, Number(producto.precio).toFixed(2)]) {
            fila.insertCell().textContent = valor ?? '';
        }
        const stock = fila.insertCell();
        stock.textContent = producto.stock;
        stock.className = producto.stock <= limiteStockBajo ? 'stock-bajo' : 'stock-normal';
        const acciones = document.createElement('div');
        acciones.className = 'acciones-tabla';
        fila.insertCell().appendChild(acciones);
        const editar = document.createElement('button');
        editar.type = 'button';
        editar.className = 'btn-editar';
        editar.textContent = 'Editar';
        editar.addEventListener('click', () => editarProducto(producto));
        const eliminar = document.createElement('button');
        eliminar.type = 'button';
        eliminar.className = 'btn-eliminar';
        eliminar.textContent = 'Eliminar';
        eliminar.addEventListener('click', () => {
            productoAEliminar = producto.id;
            campo('modalEliminar').hidden = false;
            campo('btnCancelarEliminar').focus();
        });
        acciones.append(editar, eliminar);
    }
    campo('mensajeVacio').hidden = tabla.rows.length > 0;
    campo('mensajeVacio').textContent = filtro ? 'Sin coincidencias.' : 'No hay productos registrados.';
    campo('totalProductos').textContent = productos.length;
    campo('totalUnidades').textContent = productos.reduce((total, p) => total + p.stock, 0);
    campo('productosBajos').textContent = productos.filter(p => p.stock <= limiteStockBajo).length;
}

async function cargarInventario() {
    const lista = [];
    const porPagina = 500;
    try {
        for (let inicio = 0; ; inicio += porPagina) {
            const { data, error } = await window.db.from('productos')
                .select('id::text,nombre,descripcion,categoria,precio,stock')
                .order('id').range(inicio, inicio + porPagina - 1);
            if (error) throw error;
            lista.push(...data);
            if (data.length < porPagina) break;
        }
        productos = lista;
        mostrarProductos();
    } catch {
        campo('mensajeVacio').hidden = productos.length > 0;
        campo('mensajeVacio').textContent = 'No se pudo cargar el inventario.';
        mostrarNotificacion('No se pudo actualizar la lista de productos.', 'error');
    }
}

async function guardarProducto(evento) {
    evento.preventDefault();
    const id = campo('productoId').value;
    const datos = {
        nombre: campo('nombre').value.trim(),
        descripcion: campo('descripcion').value.trim(),
        categoria: campo('categoria').value,
        precio: campo('precio').valueAsNumber,
        stock: campo('stock').valueAsNumber
    };
    if (!datos.nombre) {
        mostrarNotificacion('Escribe el nombre del producto.', 'error');
        return;
    }
    campo('btnGuardar').disabled = true;
    try {
        const tabla = window.db.from('productos');
        const operacion = id ? tabla.update(datos).eq('id', id) : tabla.insert(datos);
        const { error } = await operacion.select('id::text').single();
        if (error) throw error;
        reiniciarFormulario();
        mostrarNotificacion(id ? 'Producto actualizado.' : 'Producto registrado.', 'exito');
        await cargarInventario();
    } catch {
        mostrarNotificacion('No se pudo guardar el producto. Revisa los datos y la conexión.', 'error');
    } finally {
        campo('btnGuardar').disabled = false;
    }
}

async function eliminarProducto() {
    if (productoAEliminar === null) return;
    const id = productoAEliminar;
    campo('btnConfirmarEliminar').disabled = true;
    campo('btnCancelarEliminar').disabled = true;
    try {
        const { error } = await window.db.from('productos').delete().eq('id', id).select('id::text').single();
        if (error) throw error;
        if (campo('productoId').value === String(id)) reiniciarFormulario();
        mostrarNotificacion('Producto eliminado.', 'exito');
        await cargarInventario();
    } catch {
        mostrarNotificacion('No se pudo eliminar el producto.', 'error');
    } finally {
        campo('btnConfirmarEliminar').disabled = false;
        campo('btnCancelarEliminar').disabled = false;
        campo('modalEliminar').hidden = true;
        productoAEliminar = null;
    }
}

document.addEventListener('sesion-validada', () => {
    formulario.addEventListener('submit', guardarProducto);
    campo('btnCancelar').addEventListener('click', reiniciarFormulario);
    campo('buscarProducto').addEventListener('input', mostrarProductos);
    campo('btnConfirmarEliminar').addEventListener('click', eliminarProducto);
    campo('btnCancelarEliminar').addEventListener('click', () => {
        productoAEliminar = null;
        campo('modalEliminar').hidden = true;
    });
    cargarInventario();
}, { once: true });
