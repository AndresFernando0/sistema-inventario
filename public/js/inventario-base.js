document.addEventListener('sesion-validada', async () => {
  const el = document.getElementById('estadoConexion');
  if (!el || !window.db) return;
  try {
    const { count, error } = await window.db
      .from('productos')
      .select('id', { count: 'exact', head: true });
    if (error) throw error;
    el.textContent = 'Supabase conectado  -  ' + (count ?? 0) + ' producto(s)';
  } catch {
    el.textContent = 'No se pudo consultar productos. Revisa RLS/conexion.';
  }
});
