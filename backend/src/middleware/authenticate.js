import { createClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from '../config/supabase.js';

export async function authenticate(req, res, next) {
  const authorization = req.get('authorization') ?? '';
  const [scheme, token] = authorization.split(' ');

  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return res.status(401).json({ error: 'A valid Bearer access token is required.' });
  }

  const config = getSupabaseConfig();
  if (!config) {
    return res.status(503).json({ error: 'Supabase is not configured on the backend.' });
  }

  const authClient = createClient(config.url, config.publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await authClient.auth.getUser(token);

  if (error && [400, 401, 403].includes(error.status)) {
    return res.status(401).json({ error: 'The access token is invalid or expired.' });
  }
  if (error) {
    console.error('Supabase token verification failed:', error);
    return res.status(503).json({ error: 'Unable to verify the access token right now.' });
  }
  if (!data.user) return res.status(401).json({ error: 'The access token is invalid or expired.' });

  req.user = data.user;
  req.supabase = createClient(config.url, config.publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  return next();
}
