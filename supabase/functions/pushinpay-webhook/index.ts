// Webhook para receber notificações de pagamento da Pushinpay

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Pushinpay envia dados em formato x-www-form-urlencoded
    const contentType = req.headers.get("content-type") || "";
    let payload: any = {};

    if (contentType.includes("application/json")) {
      payload = await req.json();
    } else {
      // Parse form-urlencoded data
      const text = await req.text();
      console.log("Raw webhook data:", text);
      
      const params = new URLSearchParams(text);
      payload = {
        id: params.get("id"),
        status: params.get("status"),
        value: params.get("value"),
        payer_name: params.get("payer_name"),
        payer_cpf: params.get("payer_cpf"),
      };
    }

    console.log("Pushinpay webhook received:", payload);

    // Pushinpay envia: { id, status, value, ... }
    const pixId = payload.id;
    const status = payload.status;

    if (!pixId) {
      console.error("Webhook sem ID do PIX");
      return new Response(JSON.stringify({ message: "ID do PIX não encontrado" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Mapear status da Pushinpay para nosso status
    let newStatus = "pending";
    if (status === "paid" || status === "approved" || status === "confirmed") {
      newStatus = "paid";
    } else if (status === "cancelled" || status === "expired") {
      newStatus = "cancelled";
    }

    console.log(`Atualizando transação com pix_id=${pixId} para status=${newStatus}`);

    // Atualizar o status da transação no banco de dados
    // Usar LOWER() para fazer match case-insensitive
    const { data, error } = await supabase
      .from("transactions")
      .update({ status: newStatus })
      .ilike("pix_id", pixId)
      .select();

    if (error) {
      console.error("Erro ao atualizar transação:", error);
      return new Response(JSON.stringify({ message: "Erro ao atualizar transação", error }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!data || data.length === 0) {
      console.warn(`Nenhuma transação encontrada com pix_id=${pixId}`);
      return new Response(JSON.stringify({ message: "Transação não encontrada" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("Transação atualizada com sucesso:", data[0]);

    return new Response(JSON.stringify({ success: true, transaction: data[0] }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (e) {
    console.error("Erro no webhook:", e);
    return new Response(JSON.stringify({ message: "Erro interno", error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
