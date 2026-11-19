# Sistema de Inventario UPH

Proyecto universitario para gestionar productos, personal y proveedores desde un panel con acceso por cuenta.

**Tecnologias:** HTML, CSS, JavaScript, Supabase y Vercel.

## Modulos

- **Login:** acceso por correo y contrasena con Supabase Auth. Las paginas privadas requieren una sesion y el panel permite cerrarla.
- **Productos:** registra, consulta, busca, edita y elimina productos. Muestra las unidades disponibles y los productos con poco stock.
- **Personal:** registra, consulta, edita y elimina empleados. Usa la identidad como clave.
- **Proveedores:** registra, consulta, edita y elimina proveedores. Supabase genera el codigo.

## Uso

1. Abre el [sistema publicado](https://sistema-inventario-8njy2cix1-andres-projects-f0b2c83f.vercel.app/login.html).
2. Inicia sesion con una cuenta autorizada.
3. Selecciona un modulo en el panel. El enlace **Volver al panel** te devuelve al menu.
4. Al terminar, selecciona **Cerrar sesion**.

## Trabajo del equipo

- `feat/productos`: interfaz original de Productos importada en `694b021`. Brayan-Carcamo aporto la pagina y los estilos en `419baee` y `46142c1`.
- `feat/personal-proveedores`: Francisco Dávila aporto formularios y controlador original de ambos modulos, importados en el commit `e9e0ebd`.
- Brayan-Carcamo tambien aporto las hojas de estilo de Inventario y Personal/Proveedores en `288d818` y `f9ec83c`.
- `integracion/inventario-uph`: AndresFernando0 integro el acceso, el panel y los modulos, y completo las operaciones de registro, consulta, edicion y eliminacion.
