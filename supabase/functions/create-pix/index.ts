// Deno edge function: create-pix
// Calls Pushinpay PIX cashIn endpoint securely using server-side secret

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const token = "54012|Mcl3CB1BHZT6IS0GLtEpn86ex6c4i8WS3W8gQZmdf454d103";
    const baseUrl = "https://api.pushinpay.com.br/api";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const projectId = supabaseUrl.split("//")[1].split(".")[0];
    const webhookUrl = `https://${projectId}.supabase.co/functions/v1/pushinpay-webhook`;

    const body = await req.json().catch(() => ({}));
    const value = Number(body?.value);

    console.log("Request payload:", { value, webhook_url: webhookUrl });

    if (!Number.isInteger(value)) {
      return new Response(JSON.stringify({ message: "O campo value deve ser inteiro em centavos" }), {
        status: 422,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    if (value < 50) {
      return new Response(JSON.stringify({ message: "O campo value deve ser no mínimo 50." }), {
        status: 422,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const payload = { 
      value,
      webhook_url: webhookUrl
    };

    const apiUrl = `${baseUrl}/pix/cashIn`;
    console.log("Calling Pushinpay API:", apiUrl);

    const resp = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await resp.json().catch(() => ({}));
    console.log("Pushinpay response:", {
      status: resp.status,
      ok: resp.ok,
      data
    });

    if (!resp.ok) {
      console.error("Pushinpay API error:", data);
      return new Response(JSON.stringify(data), {
        status: resp.status,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("PIX created successfully:", data.id);
    
    // Retornar dados formatados para o frontend
    // A API PushinPay retorna: { id, qr_code, qr_code_base64, status, value }
    const formattedResponse = {
      id: data.id,
      copiaCola: data.qr_code || '',
      qrCode: data.qr_code_base64 || '',
      // Manter original para debug
      original: data
    };
    
    return new Response(JSON.stringify(formattedResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (e) {
    console.error("create-pix unexpected error:", e);
    return new Response(JSON.stringify({ message: "Erro interno", error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
