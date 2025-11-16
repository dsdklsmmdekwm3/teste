-- ============================================
-- SCRIPT COMPLETO PARA CRIAR TODAS AS TABELAS
-- Execute este SQL no Supabase Dashboard
-- ============================================

-- 1. Criar tabela site_config
CREATE TABLE IF NOT EXISTS public.site_config (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT site_config_pkey PRIMARY KEY (id),
    CONSTRAINT site_config_key_key UNIQUE (key)
);

-- 2. Criar tabela transactions
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

-- 3. Criar tabela upsell_config
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

-- 4. Criar tabela blocked_ips
CREATE TABLE IF NOT EXISTS public.blocked_ips (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address text NOT NULL,
    transaction_id uuid REFERENCES public.transactions(id),
    redirect_url text DEFAULT 'https://google.com',
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 5. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions USING btree (created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions USING btree (status);
CREATE INDEX IF NOT EXISTS idx_blocked_ips_ip_address ON public.blocked_ips(ip_address);
CREATE INDEX IF NOT EXISTS idx_blocked_ips_active ON public.blocked_ips(active);

-- 6. Habilitar Row Level Security (RLS)
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upsell_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_ips ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS RLS PARA site_config
-- ============================================
DROP POLICY IF EXISTS "Permitir leitura pública de configurações" ON public.site_config;
CREATE POLICY "Permitir leitura pública de configurações" 
ON public.site_config FOR SELECT 
TO anon, authenticated 
USING (true);

DROP POLICY IF EXISTS "Permitir inserção pública de configurações" ON public.site_config;
CREATE POLICY "Permitir inserção pública de configurações" 
ON public.site_config FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir atualização pública de configurações" ON public.site_config;
CREATE POLICY "Permitir atualização pública de configurações" 
ON public.site_config FOR UPDATE 
TO anon, authenticated 
USING (true) 
WITH CHECK (true);

-- ============================================
-- POLÍTICAS RLS PARA transactions
-- ============================================
DROP POLICY IF EXISTS "Permitir leitura pública de transações" ON public.transactions;
CREATE POLICY "Permitir leitura pública de transações" 
ON public.transactions FOR SELECT 
TO anon, authenticated 
USING (true);

DROP POLICY IF EXISTS "Permitir inserção pública de transações" ON public.transactions;
CREATE POLICY "Permitir inserção pública de transações" 
ON public.transactions FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir atualização pública de transações" ON public.transactions;
CREATE POLICY "Permitir atualização pública de transações" 
ON public.transactions FOR UPDATE 
TO anon, authenticated 
USING (true) 
WITH CHECK (true);

-- ============================================
-- POLÍTICAS RLS PARA upsell_config
-- ============================================
DROP POLICY IF EXISTS "upsell_config_select_policy" ON public.upsell_config;
DROP POLICY IF EXISTS "upsell_config_insert_policy" ON public.upsell_config;
DROP POLICY IF EXISTS "upsell_config_update_policy" ON public.upsell_config;
DROP POLICY IF EXISTS "upsell_config_delete_policy" ON public.upsell_config;
DROP POLICY IF EXISTS "Permitir leitura pública de configurações" ON public.upsell_config;
DROP POLICY IF EXISTS "Permitir inserção pública de upsells" ON public.upsell_config;
DROP POLICY IF EXISTS "Permitir atualização pública de configurações" ON public.upsell_config;
DROP POLICY IF EXISTS "Permitir exclusão pública de upsells" ON public.upsell_config;

CREATE POLICY "upsell_config_select_policy" 
ON public.upsell_config FOR SELECT 
TO anon, authenticated 
USING (true);

CREATE POLICY "upsell_config_insert_policy" 
ON public.upsell_config FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

CREATE POLICY "upsell_config_update_policy" 
ON public.upsell_config FOR UPDATE 
TO anon, authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "upsell_config_delete_policy" 
ON public.upsell_config FOR DELETE 
TO anon, authenticated 
USING (true);

-- ============================================
-- POLÍTICAS RLS PARA blocked_ips
-- ============================================
DROP POLICY IF EXISTS "Permitir leitura pública de IPs bloqueados" ON public.blocked_ips;
CREATE POLICY "Permitir leitura pública de IPs bloqueados" 
ON public.blocked_ips FOR SELECT 
TO anon, authenticated 
USING (true);

DROP POLICY IF EXISTS "Permitir inserção pública de IPs bloqueados" ON public.blocked_ips;
CREATE POLICY "Permitir inserção pública de IPs bloqueados" 
ON public.blocked_ips FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir atualização pública de IPs bloqueados" ON public.blocked_ips;
CREATE POLICY "Permitir atualização pública de IPs bloqueados" 
ON public.blocked_ips FOR UPDATE 
TO anon, authenticated 
USING (true) 
WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir exclusão pública de IPs bloqueados" ON public.blocked_ips;
CREATE POLICY "Permitir exclusão pública de IPs bloqueados" 
ON public.blocked_ips FOR DELETE 
TO anon, authenticated 
USING (true);

-- ============================================
-- FIM DO SCRIPT
-- ============================================

