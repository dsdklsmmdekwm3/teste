// Check PIX payment status
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
    
    const { pixId } = await req.json();

    if (!pixId) {
      return new Response(JSON.stringify({ message: "pixId é obrigatório" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("Checking PIX status for:", pixId);

    const apiUrl = `${baseUrl}/transactions/${pixId}`;
    const resp = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    const data = await resp.json();
    console.log("Pushinpay status response:", data);

    if (!resp.ok) {
      console.error("Pushinpay API error:", data);
      return new Response(JSON.stringify(data), {
        status: resp.status,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (e) {
    console.error("check-pix-status error:", e);
    return new Response(JSON.stringify({ message: "Erro interno", error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
