(async () => {
  const login = new URL('../login.html', document.currentScript.src).href;
  let redirigiendo = false;
  function irAlLogin() {
    if (redirigiendo) return;
    redirigiendo = true;
    window.location.replace(login);
  }
  window.addEventListener('pageshow', event => {
    if (event.persisted) window.location.reload();
  });
  const loading = document.getElementById('verificandoAcceso');
  const content = document.getElementById('contenidoProtegido');
  const logout = document.getElementById('cerrarSesion');
  if (!window.db) {
    if (loading) loading.textContent = 'No se pudo cargar Supabase.';
    return;
  }
  window.db.auth.onAuthStateChange(event => {
    if (event === 'SIGNED_OUT') {
      if (content) content.hidden = true;
      irAlLogin();
    }
  });
  try {
    const { data: { user }, error } = await window.db.auth.getUser();
    if (error || !user) {
      irAlLogin();
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
      irAlLogin();
      return;
    }
    logout.disabled = false;
    const message = document.getElementById('mensajePanel');
    if (message) { message.textContent = 'No se pudo cerrar sesion.'; message.hidden = false; }
  });
})();
