// API Route para verificar status do PIX
import type { VercelRequest, VercelResponse } from '@vercel/node';

const PUSHINPAY_TOKEN = '54012|Mcl3CB1BHZT6IS0GLtEpn86ex6c4i8WS3W8gQZmdf454d103';
const PUSHINPAY_BASE_URL = 'https://api.pushinpay.com.br/api';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'ID do PIX é obrigatório' });
    }

    // Consultar status do PIX na PushinPay
    const response = await fetch(`${PUSHINPAY_BASE_URL}/transactions/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PUSHINPAY_TOKEN}`,
        'Accept': 'application/json',
      }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('PushinPay API error:', data);
      return res.status(response.status).json(data);
    }

    // Retornar status formatado
    return res.status(200).json({
      id: data.id,
      status: data.status || 'pending',
      value: data.value,
      paid_at: data.paid_at,
      original: data
    });
  } catch (error: any) {
    console.error('Erro ao verificar PIX:', error);
    return res.status(500).json({ 
      message: 'Erro interno ao verificar PIX',
      error: error.message 
    });
  }
}

