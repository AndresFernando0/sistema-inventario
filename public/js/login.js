const form = document.getElementById('loginForm');
const emailInput = document.getElementById('correo');
const passwordInput = document.getElementById('contrasena');
const loginButton = document.getElementById('botonEntrar');
const message = document.getElementById('mensajeLogin');
const toggle = document.getElementById('verPassword');
function mostrarErrorLogin(text) {
  message.textContent = text;
  message.hidden = false;
}
toggle.addEventListener('click', () => {
  const show = passwordInput.type === 'password';
  passwordInput.type = show ? 'text' : 'password';
  toggle.textContent = show ? 'Ocultar' : 'Mostrar';
  toggle.setAttribute('aria-label', show ? 'Ocultar contrasena' : 'Mostrar contrasena');
  toggle.setAttribute('aria-pressed', String(show));
});
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  message.hidden = true;
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  if (!email || !emailInput.validity.valid || !password) {
    mostrarErrorLogin('Introduce un correo valido y tu contrasena.');
    return;
  }
  if (!window.db) {
    mostrarErrorLogin('No se pudo conectar con Supabase.');
    return;
  }
  loginButton.disabled = true;
  loginButton.textContent = 'Verificando acceso...';
  try {
    const { error } = await window.db.auth.signInWithPassword({ email, password });
    if (error) {
      mostrarErrorLogin('No se pudo iniciar sesion. Revisa tu correo y contrasena.');
      return;
    }
    window.location.replace('./inventario.html');
  } catch {
    mostrarErrorLogin('Problema de conexion. Intenta de nuevo.');
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = 'Iniciar sesion';
  }
});
(async () => {
  if (!window.db) return;
  try {
    const { data: { user }, error } = await window.db.auth.getUser();
    if (!error && user) window.location.replace('./inventario.html');
  } catch { /* Mostrar formulario hasta comprobar conexion */ }
})();
