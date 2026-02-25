type WelcomeEmailInput = {
  email: string;
  fullName: string;
  role: string;
  schoolName?: string;
  schoolCode?: string;
  createdBy?: string;
};

export async function sendWelcomeEmail(input: WelcomeEmailInput): Promise<{ sent: boolean; error?: string }> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return { sent: false, error: 'Supabase environment variables are not configured.' };
  }

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/send-welcome-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        email: input.email.trim().toLowerCase(),
        fullName: input.fullName.trim(),
        role: input.role,
        schoolName: input.schoolName || '',
        schoolCode: input.schoolCode || '',
        createdBy: input.createdBy || 'System',
      }),
    });

    if (!response.ok) {
      const message = await response.text();
      return { sent: false, error: message || 'Email service returned an error.' };
    }

    return { sent: true };
  } catch (error) {
    return { sent: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
