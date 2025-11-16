// Configuração para escolher entre Supabase ou LocalStorage
// Mude USE_LOCAL_STORAGE para true para usar localStorage

export const USE_LOCAL_STORAGE = false; // true = localStorage, false = Supabase (PADRÃO)

export const getStorage = () => {
  if (USE_LOCAL_STORAGE) {
    // Usar localStorage
    const { storage } = require('./storage-adapter');
    return storage;
  } else {
    // Usar Supabase
    const { supabaseClient } = require('./supabase-helpers');
    return supabaseClient;
  }
};

