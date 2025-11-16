-- Criar tabela de backups
CREATE TABLE IF NOT EXISTS public.backups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  restored_at TIMESTAMP WITH TIME ZONE,
  description TEXT
);

-- Habilitar RLS
ALTER TABLE public.backups ENABLE ROW LEVEL SECURITY;

-- Política para permitir todas as operações (ajuste conforme necessário)
CREATE POLICY "Allow all operations on backups" ON public.backups
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_backups_created_at ON public.backups(created_at DESC);

