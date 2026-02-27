import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const missingConfig = !supabaseUrl || !supabaseKey;

export const getSupabaseConfigError = (): string | null => {
	if (!supabaseUrl && !supabaseKey) {
		return 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.';
	}
	if (!supabaseUrl) {
		return 'Supabase URL is missing. Set VITE_SUPABASE_URL in your environment variables.';
	}
	if (!supabaseKey) {
		return 'Supabase anon key is missing. Set VITE_SUPABASE_ANON_KEY in your environment variables.';
	}
	return null;
};

export const isSupabaseConfigured = !missingConfig;

export const supabase = createClient(
	supabaseUrl || 'https://invalid-project.supabase.co',
	supabaseKey || 'missing-supabase-anon-key'
);
