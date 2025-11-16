// Helper para chamar API PIX - tenta rotas internas primeiro, depois Supabase

/**
 * Criar PIX - tenta rotas internas primeiro, depois Supabase
 */
export async function createPix(value: number): Promise<{
  id: string;
  copiaCola: string;
  qrCode: string;
}> {
  // Tentar usar rota interna primeiro (localhost:3000)
  try {
    const localResponse = await fetch('http://localhost:3000/api/pix/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ value }),
    });

    if (localResponse.ok) {
      const data = await localResponse.json();
      console.log('✅ PIX criado via rota interna:', data);
      
      return {
        id: data.id || '',
        copiaCola: data.copiaCola || data.original?.qr_code || '',
        qrCode: data.qrCode || data.original?.qr_code_base64 || '',
      };
    }
  } catch (error) {
    console.log('⚠️  Rota interna não disponível, tentando Supabase...');
  }

  // Fallback: usar função do Supabase
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    const { data, error } = await supabase.functions.invoke('create-pix', {
      body: { value }
    });

    if (error) {
      console.error('❌ Erro ao criar PIX via Supabase:', error);
      throw new Error(error.message || 'Erro ao gerar pagamento PIX');
    }

    if (!data) {
      throw new Error('Resposta vazia da função create-pix');
    }

    console.log('✅ PIX criado via Supabase:', data);
    
    return {
      id: data.id || data.original?.id || '',
      copiaCola: data.copiaCola || data.original?.qr_code || '',
      qrCode: data.qrCode || data.original?.qr_code_base64 || '',
    };
  } catch (error) {
    console.error('❌ Erro ao criar PIX:', error);
    throw error;
  }
}

/**
 * Verificar status do PIX - tenta rotas internas primeiro, depois Supabase
 */
export async function checkPixStatus(pixId: string): Promise<{
  id: string;
  status: string;
  value?: number;
  paid_at?: string;
}> {
  // Tentar usar rota interna primeiro (localhost:3000)
  try {
    const localResponse = await fetch(`http://localhost:3000/api/pix/check-by-pixid/${pixId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (localResponse.ok) {
      const data = await localResponse.json();
      console.log('✅ Status verificado via rota interna:', data);
      
      return {
        id: data.id || pixId,
        status: data.status || 'pending',
        value: data.value,
        paid_at: data.paid_at,
      };
    }
  } catch (error) {
    console.log('⚠️  Rota interna não disponível, tentando Supabase...');
  }

  // Fallback: usar função do Supabase
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    const { data, error } = await supabase.functions.invoke('check-pix-status', {
      body: { pixId }
    });

    if (error) {
      console.error('❌ Erro ao verificar status via Supabase:', error);
      throw new Error(error.message || 'Erro ao verificar status do PIX');
    }

    if (!data) {
      throw new Error('Resposta vazia da função check-pix-status');
    }

    console.log('✅ Status verificado via Supabase:', data);

    return {
      id: data.id || pixId,
      status: data.status || 'pending',
      value: data.value,
      paid_at: data.paid_at,
    };
  } catch (error) {
    console.error('❌ Erro ao verificar status do PIX:', error);
    throw error;
  }
}
