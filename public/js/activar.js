(async () => {
  const datos = new URLSearchParams(location.hash.slice(1));
  history.replaceState(null, '', location.pathname);
  const estado = document.getElementById('estado');
  const form = document.getElementById('activar');
  const nueva = document.getElementById('nueva');
  if (datos.has('error') || datos.get('type') !== 'invite' ||
      !datos.get('access_token') || !datos.get('refresh_token')) {
    estado.textContent = 'La invitacion no es valida o ya vencio. Solicita una nueva.';
    return;
  }

  try {
    const auth = window.db.auth;
    const { data, error } = await auth.setSession({
      access_token: datos.get('access_token'),
      refresh_token: datos.get('refresh_token')
    });
    if (error || !data.user) throw new Error();
    const invitado = data.user.id;
    estado.textContent = 'Elige una contrasena de al menos 16 caracteres para ' + data.user.email + '.';
    form.hidden = false;
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const boton = form.querySelector('button');
      boton.disabled = true;
      try {
        const actual = await auth.getUser();
        if (actual.error || actual.data.user?.id !== invitado) {
          estado.textContent = 'La sesion cambio. Solicita otra invitacion.';
          form.hidden = true;
          form.reset();
          return;
        }
        const cambio = await auth.updateUser({ password: nueva.value });
        if (cambio.error) throw new Error();
        form.reset();
        form.hidden = true;
        estado.textContent = 'Contrasena guardada. Ya puedes acceder al sistema.';
        await auth.signOut({ scope: 'local' });
      } catch {
        if (!form.hidden) estado.textContent = 'No se pudo guardar la contrasena. Revisa la conexion e intenta de nuevo.';
      } finally {
        boton.disabled = false;
      }
    });
  } catch {
    estado.textContent = 'No se pudo validar la invitacion. Solicita un enlace nuevo.';
  }
})();
