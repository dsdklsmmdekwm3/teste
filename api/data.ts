// API Route do Vercel para salvar/carregar dados
// Funciona como um "banco de dados" usando arquivos JSON

import type { VercelRequest, VercelResponse } from '@vercel/node';

// No Vercel, usamos /tmp para arquivos temporários (único diretório gravável)
const DATA_FILE = '/tmp/app-data.json';

// Carregar dados do arquivo
async function loadData() {
  try {
    const fs = await import('fs/promises');
    const content = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error: any) {
    // Se arquivo não existe, retornar estrutura vazia
    if (error.code === 'ENOENT') {
      return {
        transactions: [],
        site_config: [],
        upsell_config: [],
        blocked_ips: [],
      };
    }
    console.error('Error loading data:', error);
    return {
      transactions: [],
      site_config: [],
      upsell_config: [],
      blocked_ips: [],
    };
  }
}

// Salvar dados no arquivo
async function saveData(data: any) {
  try {
    const fs = await import('fs/promises');
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error saving data:', error);
    return false;
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Carregar dados
      const data = await loadData();
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      // Salvar dados
      const data = req.body;
      const success = await saveData(data);
      
      if (success) {
        return res.status(200).json({ success: true, message: 'Data saved successfully' });
      } else {
        return res.status(500).json({ success: false, message: 'Failed to save data' });
      }
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
}

