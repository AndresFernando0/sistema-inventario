const SUPABASE_URL = 'https://bpdyegwtnzcuufotbylv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_pvqggCBuK1XFyddqDXCjTA_ygCQgNMW';
if (!window.supabase?.createClient) {
  console.error('No se cargo la biblioteca de Supabase.');
  window.db = null;
} else {
  window.db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
  });
}
