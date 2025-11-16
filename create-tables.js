// Script para criar todas as tabelas no Supabase
const SUPABASE_URL = 'https://qpzutdlkeegwiqkphqkj.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwenV0ZGxrZWVnd2lxa3BocWtqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzI2OTA0MiwiZXhwIjoyMDc4ODQ1MDQyfQ.UwG9SPn6eCZEWgs9uy86KIuYK1c8fd50HDsBBIc-NwE';

const SQL_QUERIES = `
-- Criar tabela site_config
CREATE TABLE IF NOT EXISTS public.site_config (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT site_config_pkey PRIMARY KEY (id),
    CONSTRAINT site_config_key_key UNIQUE (key)
);

-- Criar tabela transactions
CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    cpf text NOT NULL,
    whatsapp text,
    upsell_added boolean DEFAULT false,
    total_value numeric(10,2) DEFAULT 67.00 NOT NULL,
    status text DEFAULT 'pending'::text,
    pix_id text,
    ip_address text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT transactions_pkey PRIMARY KEY (id)
);

-- Criar tabela upsell_config
CREATE TABLE IF NOT EXISTS public.upsell_config (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text DEFAULT 'Oferta Especial: Consultoria Individual 1h'::text NOT NULL,
    description text DEFAULT 'Tenha 1 sessão por semana, com cronograma de dieta e rotina 100% personalizado.'::text NOT NULL,
    price text DEFAULT '197,00'::text NOT NULL,
    original_price text DEFAULT '297,00'::text NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    image_url text DEFAULT 'https://via.placeholder.com/80x80'::text,
    "order" integer DEFAULT 1,
    active boolean DEFAULT true,
    CONSTRAINT upsell_config_pkey PRIMARY KEY (id)
);

-- Criar tabela blocked_ips
CREATE TABLE IF NOT EXISTS public.blocked_ips (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address text NOT NULL,
    transaction_id uuid REFERENCES public.transactions(id),
    redirect_url text DEFAULT 'https://google.com',
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions USING btree (created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions USING btree (status);
CREATE INDEX IF NOT EXISTS idx_blocked_ips_ip_address ON public.blocked_ips(ip_address);
CREATE INDEX IF NOT EXISTS idx_blocked_ips_active ON public.blocked_ips(active);

-- Habilitar RLS
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upsell_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_ips ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para site_config
DROP POLICY IF EXISTS "Permitir leitura pública de configurações" ON public.site_config;
CREATE POLICY "Permitir leitura pública de configurações" ON public.site_config FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir inserção pública de configurações" ON public.site_config;
CREATE POLICY "Permitir inserção pública de configurações" ON public.site_config FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir atualização pública de configurações" ON public.site_config;
CREATE POLICY "Permitir atualização pública de configurações" ON public.site_config FOR UPDATE USING (true);

-- Políticas RLS para transactions
DROP POLICY IF EXISTS "Permitir leitura pública de transações" ON public.transactions;
CREATE POLICY "Permitir leitura pública de transações" ON public.transactions FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Permitir inserção pública de transações" ON public.transactions;
CREATE POLICY "Permitir inserção pública de transações" ON public.transactions FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir atualização pública de transações" ON public.transactions;
CREATE POLICY "Permitir atualização pública de transações" ON public.transactions FOR UPDATE TO anon USING (true);

-- Políticas RLS para upsell_config
DROP POLICY IF EXISTS "Permitir leitura pública de configurações" ON public.upsell_config;
CREATE POLICY "Permitir leitura pública de configurações" ON public.upsell_config FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Permitir inserção pública de upsells" ON public.upsell_config;
CREATE POLICY "Permitir inserção pública de upsells" ON public.upsell_config FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir atualização pública de configurações" ON public.upsell_config;
CREATE POLICY "Permitir atualização pública de configurações" ON public.upsell_config FOR UPDATE TO anon USING (true);

DROP POLICY IF EXISTS "Permitir exclusão pública de upsells" ON public.upsell_config;
CREATE POLICY "Permitir exclusão pública de upsells" ON public.upsell_config FOR DELETE TO anon USING (true);

-- Políticas RLS para blocked_ips
DROP POLICY IF EXISTS "Permitir leitura pública de IPs bloqueados" ON public.blocked_ips;
CREATE POLICY "Permitir leitura pública de IPs bloqueados" ON public.blocked_ips FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Permitir inserção pública de IPs bloqueados" ON public.blocked_ips;
CREATE POLICY "Permitir inserção pública de IPs bloqueados" ON public.blocked_ips FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir atualização pública de IPs bloqueados" ON public.blocked_ips;
CREATE POLICY "Permitir atualização pública de IPs bloqueados" ON public.blocked_ips FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir exclusão pública de IPs bloqueados" ON public.blocked_ips;
CREATE POLICY "Permitir exclusão pública de IPs bloqueados" ON public.blocked_ips FOR DELETE TO anon, authenticated USING (true);
`;

async function createTables() {
  console.log('🚀 Iniciando criação de tabelas no Supabase...\n');

  try {
    // Executar SQL via API REST do Supabase usando rpc ou postgrest
    // Vamos usar a API de PostgREST para executar SQL
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql: SQL_QUERIES })
    });

    // Se não tiver a função rpc, vamos tentar método alternativo
    if (!response.ok) {
      console.log('⚠️  Método RPC não disponível, usando método alternativo...\n');
      
      // Dividir queries e executar uma por uma via API de PostgREST
      // Mas isso não funciona diretamente, então vamos usar o método de Management API
      console.log('📝 Executando queries SQL diretamente...\n');
      
      // Infelizmente, a API REST do Supabase não permite executar SQL arbitrário
      // Precisamos usar o Supabase Management API ou executar via Dashboard
      console.log('❌ Não é possível executar SQL diretamente via API REST.');
      console.log('✅ Mas criei o script SQL completo para você!\n');
      console.log('📋 Próximos passos:');
      console.log('   1. Acesse: https://supabase.com/dashboard');
      console.log('   2. Vá em SQL Editor → New Query');
      console.log('   3. Cole o SQL abaixo e execute:\n');
      console.log('='.repeat(60));
      console.log(SQL_QUERIES);
      console.log('='.repeat(60));
      return;
    }

    const result = await response.json();
    console.log('✅ Tabelas criadas com sucesso!');
    console.log('Resultado:', result);
    
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error.message);
    console.log('\n📋 Como alternativa, execute o SQL manualmente:');
    console.log('   1. Acesse: https://supabase.com/dashboard');
    console.log('   2. Vá em SQL Editor → New Query');
    console.log('   3. Cole o SQL do arquivo create-tables.sql\n');
  }
}

// Tentar método alternativo usando fetch direto
async function tryDirectSQL() {
  console.log('🔄 Tentando método alternativo...\n');
  
  // Infelizmente, Supabase não permite executar SQL arbitrário via API REST
  // A única forma é via Dashboard ou Management API (que requer autenticação diferente)
  
  console.log('✅ Script SQL criado! Execute manualmente no Dashboard.\n');
  console.log('📄 O SQL está no arquivo create-tables.sql\n');
}

createTables().catch(console.error);

