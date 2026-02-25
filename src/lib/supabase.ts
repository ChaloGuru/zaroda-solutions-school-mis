import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://plcxnazifoexlmttdhiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsY3huYXppZm9leGxtdHRkaGl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NDQxMjMsImV4cCI6MjA4NzUyMDEyM30.C6PXDi1spaLkwBKDhdq8VqkqdOUOzL_nFRw8iGV1GgY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
