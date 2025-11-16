-- ============================================
-- CORREÇÃO DEFINITIVA DAS POLÍTICAS RLS PARA UPSELL_CONFIG
-- Este script remove todas as políticas antigas e cria novas com permissões corretas
-- ============================================

-- 1. Remover TODAS as políticas existentes de upsell_config (para evitar conflitos)
DROP POLICY IF EXISTS "Permitir inserção pública de upsells" ON public.upsell_config;
DROP POLICY IF EXISTS "Permitir exclusão pública de upsells" ON public.upsell_config;
DROP POLICY IF EXISTS "Permitir inserção pública de configurações" ON public.upsell_config;
DROP POLICY IF EXISTS "Permitir exclusão pública de configurações" ON public.upsell_config;
DROP POLICY IF EXISTS "Permitir atualização pública de configurações" ON public.upsell_config;
DROP POLICY IF EXISTS "Permitir leitura pública de configurações" ON public.upsell_config;

-- 2. Criar políticas completas e corretas para upsell_config
-- SELECT: Permitir leitura pública
CREATE POLICY "upsell_config_select_policy" ON public.upsell_config 
FOR SELECT 
TO anon, authenticated 
USING (true);

-- INSERT: Permitir inserção pública
CREATE POLICY "upsell_config_insert_policy" ON public.upsell_config 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- UPDATE: Permitir atualização pública
CREATE POLICY "upsell_config_update_policy" ON public.upsell_config 
FOR UPDATE 
TO anon, authenticated 
USING (true)
WITH CHECK (true);

-- DELETE: Permitir exclusão pública
CREATE POLICY "upsell_config_delete_policy" ON public.upsell_config 
FOR DELETE 
TO anon, authenticated 
USING (true);

-- 3. Verificar se as políticas foram criadas
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public' 
    AND tablename = 'upsell_config';
  
  RAISE NOTICE 'Total de políticas criadas para upsell_config: %', policy_count;
END $$;

