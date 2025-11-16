-- Adicionar campo ip_address na tabela transactions
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS ip_address TEXT;

-- Criar tabela blocked_ips
CREATE TABLE IF NOT EXISTS public.blocked_ips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address TEXT NOT NULL,
    transaction_id UUID REFERENCES public.transactions(id),
    redirect_url TEXT DEFAULT 'https://google.com',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Criar índice para busca rápida de IPs bloqueados
CREATE INDEX IF NOT EXISTS idx_blocked_ips_ip_address ON public.blocked_ips(ip_address);
CREATE INDEX IF NOT EXISTS idx_blocked_ips_active ON public.blocked_ips(active);

-- Políticas RLS para blocked_ips
ALTER TABLE public.blocked_ips ENABLE ROW LEVEL SECURITY;

-- Permitir SELECT para anon e authenticated
CREATE POLICY "Permitir leitura pública de IPs bloqueados"
ON public.blocked_ips
FOR SELECT
TO anon, authenticated
USING (true);

-- Permitir INSERT para anon e authenticated (para o admin)
CREATE POLICY "Permitir inserção pública de IPs bloqueados"
ON public.blocked_ips
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Permitir UPDATE para anon e authenticated
CREATE POLICY "Permitir atualização pública de IPs bloqueados"
ON public.blocked_ips
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Permitir DELETE para anon e authenticated
CREATE POLICY "Permitir exclusão pública de IPs bloqueados"
ON public.blocked_ips
FOR DELETE
TO anon, authenticated
USING (true);

