import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabaseConfigError = !supabaseUrl || !supabasePublishableKey
  ? 'Chưa cấu hình Supabase. Hãy thêm VITE_SUPABASE_URL và VITE_SUPABASE_PUBLISHABLE_KEY vào frontend/.env.local.'
  : null;

export const supabase = supabaseConfigError
  ? null
  : createClient(supabaseUrl, supabasePublishableKey);
