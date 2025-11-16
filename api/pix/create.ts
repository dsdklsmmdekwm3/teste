// API Route para criar PIX - funciona localmente e no Vercel
import type { VercelRequest, VercelResponse } from '@vercel/node';

const PUSHINPAY_TOKEN = '54012|Mcl3CB1BHZT6IS0GLtEpn86ex6c4i8WS3W8gQZmdf454d103';
const PUSHINPAY_BASE_URL = 'https://api.pushinpay.com.br/api';
// Webhook - pode ser configurado via variável de ambiente WEBHOOK_URL
// Ou gere um em https://webhook.site/#!/new
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://webhook.site/unique-id-aqui';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { value } = req.body;

    if (!value || !Number.isInteger(value) || value < 50) {
      return res.status(422).json({ 
        message: 'O campo value deve ser inteiro em centavos (mínimo 50)' 
      });
    }

    // Criar PIX na PushinPay
    const response = await fetch(`${PUSHINPAY_BASE_URL}/pix/cashIn`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PUSHINPAY_TOKEN}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        value: value,
        webhook_url: WEBHOOK_URL
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('PushinPay API error:', data);
      return res.status(response.status).json(data);
    }

    console.log('PIX criado com sucesso:', data.id);
    console.log('Resposta completa:', JSON.stringify(data, null, 2));

    // Retornar dados formatados
    // A API retorna: { id, qr_code, qr_code_base64, status, value }
    // O qr_code é o código copia e cola completo
    const formattedResponse = {
      id: data.id,
      copiaCola: data.qr_code || data.pix?.copia_cola || data.copia_cola || '',
      qrCode: data.qr_code_base64 || data.pix?.qr_code || data.qr_code || '',
      // Manter resposta original para debug
      original: data
    };

    return res.status(200).json(formattedResponse);
  } catch (error: any) {
    console.error('Erro ao criar PIX:', error);
    return res.status(500).json({ 
      message: 'Erro interno ao criar PIX',
      error: error.message 
    });
  }
}

