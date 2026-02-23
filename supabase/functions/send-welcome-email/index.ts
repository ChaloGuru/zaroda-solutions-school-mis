import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type WelcomePayload = {
  email?: string;
  fullName?: string;
  role?: string;
  schoolName?: string;
  schoolCode?: string;
  createdBy?: string;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY is not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as WelcomePayload;
    const email = body.email?.trim().toLowerCase();
    const fullName = body.fullName?.trim() || "User";
    const role = body.role?.trim().toUpperCase() || "USER";
    const schoolName = body.schoolName?.trim() || "";
    const schoolCode = body.schoolCode?.trim() || "";
    const createdBy = body.createdBy?.trim() || "System";

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fromEmail = Deno.env.get("WELCOME_FROM_EMAIL") || "Zaroda Solutions <onboarding@resend.dev>";

    const subject = "Welcome to Zaroda Solutions - Account Registered";
    const schoolLine = schoolName ? `<p><strong>School:</strong> ${schoolName}${schoolCode ? ` (${schoolCode})` : ""}</p>` : (schoolCode ? `<p><strong>School Code:</strong> ${schoolCode}</p>` : "");

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
        <h2 style="margin: 0 0 12px; color: #0f766e;">Welcome to Zaroda Solutions</h2>
        <p>Hello ${fullName},</p>
        <p>Your account has been successfully registered on <strong>Zaroda Solutions</strong>.</p>
        <p><strong>Role:</strong> ${role}</p>
        ${schoolLine}
        <p><strong>Status:</strong> Verified registration notice sent.</p>
        <p>This account was created by: ${createdBy}.</p>
        <p>You can now sign in using your registered email and assigned credentials.</p>
        <p style="margin-top: 20px;">Regards,<br/>Zaroda Solutions Team</p>
      </div>
    `;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [email],
        subject,
        html,
      }),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      return new Response(JSON.stringify({ error: `Failed to send email: ${errorText}` }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resendResponse.json();
    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
