// Sistema de armazenamento local sem dependência de banco de dados
// Usa localStorage + sincronização com API routes do Vercel

export interface LocalData {
  transactions: any[];
  site_config: any[];
  upsell_config: any[];
  blocked_ips: any[];
}

const STORAGE_KEY = 'app_data';
const SYNC_ENABLED = true; // Ativar sincronização com API quando no Vercel

// Carregar dados do localStorage
export const loadLocalData = (): LocalData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading local data:', error);
  }
  
  // Retornar estrutura vazia se não houver dados
  return {
    transactions: [],
    site_config: [],
    upsell_config: [],
    blocked_ips: [],
  };
};

// Salvar dados no localStorage
export const saveLocalData = (data: Partial<LocalData>) => {
  try {
    const current = loadLocalData();
    const updated = { ...current, ...data };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    // Sincronizar com API se estiver em produção
    if (SYNC_ENABLED && typeof window !== 'undefined') {
      syncToAPI(updated).catch(err => {
        console.warn('Failed to sync to API:', err);
      });
    }
    
    return updated;
  } catch (error) {
    console.error('Error saving local data:', error);
    throw error;
  }
};

// Sincronizar com API do Vercel
const syncToAPI = async (data: LocalData) => {
  try {
    const apiUrl = '/api/data';
    await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  } catch (error) {
    // Silenciosamente falha se API não estiver disponível (modo local)
    console.warn('API sync failed (running in local mode):', error);
  }
};

// Carregar dados da API (quando disponível)
export const loadFromAPI = async (): Promise<LocalData | null> => {
  try {
    const apiUrl = '/api/data';
    const response = await fetch(apiUrl);
    
    if (response.ok) {
      const data = await response.json();
      // Salvar localmente também
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return data;
    }
  } catch (error) {
    console.warn('API not available, using local storage:', error);
  }
  
  return null;
};

// Operações específicas para cada tipo de dado

// Transactions
export const getTransactions = (): any[] => {
  return loadLocalData().transactions || [];
};

export const saveTransaction = (transaction: any) => {
  const data = loadLocalData();
  const transactions = [...(data.transactions || []), transaction];
  return saveLocalData({ transactions });
};

export const updateTransaction = (id: string, updates: any) => {
  const data = loadLocalData();
  const transactions = (data.transactions || []).map((t: any) =>
    t.id === id ? { ...t, ...updates } : t
  );
  return saveLocalData({ transactions });
};

// Site Config
export const getSiteConfig = (key?: string): any => {
  const configs = loadLocalData().site_config || [];
  if (key) {
    return configs.find((c: any) => c.key === key);
  }
  return configs;
};

export const setSiteConfig = (key: string, value: string) => {
  const data = loadLocalData();
  const configs = [...(data.site_config || [])];
  const existingIndex = configs.findIndex((c: any) => c.key === key);
  
  const configItem = {
    key,
    value,
    updated_at: new Date().toISOString(),
  };
  
  if (existingIndex >= 0) {
    configs[existingIndex] = configItem;
  } else {
    configs.push(configItem);
  }
  
  return saveLocalData({ site_config: configs });
};

// Upsell Config
export const getUpsells = (): any[] => {
  return loadLocalData().upsell_config || [];
};

export const saveUpsell = (upsell: any) => {
  const data = loadLocalData();
  const upsells = [...(data.upsell_config || []), upsell];
  return saveLocalData({ upsell_config: upsells });
};

export const updateUpsell = (id: string, updates: any) => {
  const data = loadLocalData();
  const upsells = (data.upsell_config || []).map((u: any) =>
    u.id === id ? { ...u, ...updates } : u
  );
  return saveLocalData({ upsell_config: upsells });
};

export const deleteUpsell = (id: string) => {
  const data = loadLocalData();
  const upsells = (data.upsell_config || []).filter((u: any) => u.id !== id);
  return saveLocalData({ upsell_config: upsells });
};

// Blocked IPs
export const getBlockedIPs = (): any[] => {
  return loadLocalData().blocked_ips || [];
};

export const blockIP = (blockedIP: any) => {
  const data = loadLocalData();
  const blockedIPs = [...(data.blocked_ips || []), blockedIP];
  return saveLocalData({ blocked_ips: blockedIPs });
};

export const unblockIP = (id: string) => {
  const data = loadLocalData();
  const blockedIPs = (data.blocked_ips || []).map((ip: any) =>
    ip.id === id ? { ...ip, active: false } : ip
  );
  return saveLocalData({ blocked_ips: blockedIPs });
};

// Exportar/Importar dados (backup)
export const exportData = (): string => {
  return JSON.stringify(loadLocalData(), null, 2);
};

export const importData = (jsonString: string) => {
  try {
    const data = JSON.parse(jsonString);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return data;
  } catch (error) {
    console.error('Error importing data:', error);
    throw error;
  }
};

// Limpar todos os dados
export const clearAllData = () => {
  localStorage.removeItem(STORAGE_KEY);
};
