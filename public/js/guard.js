(async () => {
  const loading = document.getElementById('verificandoAcceso');
  const content = document.getElementById('contenidoProtegido');
  const logout = document.getElementById('cerrarSesion');
  if (!window.db) {
    if (loading) loading.textContent = 'No se pudo cargar Supabase.';
    return;
  }
  try {
    const { data: { user }, error } = await window.db.auth.getUser();
    if (error || !user) {
      window.location.replace('./login.html');
      return;
    }
    const email = document.getElementById('usuarioActual');
    if (email) email.textContent = user.email || 'Usuario autorizado';
    if (content) content.hidden = false;
    if (loading) loading.hidden = true;
    document.dispatchEvent(new CustomEvent('sesion-validada', { detail: { user } }));
  } catch {
    if (loading) loading.textContent = 'No fue posible verificar la sesion.';
    return;
  }
  if (!logout) return;
  logout.addEventListener('click', async () => {
    logout.disabled = true;
    const { error } = await window.db.auth.signOut();
    if (!error) {
      window.location.replace('./login.html');
      return;
    }
    logout.disabled = false;
    const message = document.getElementById('mensajePanel');
    if (message) { message.textContent = 'No se pudo cerrar sesion.'; message.hidden = false; }
  });
})();
