-- ============================================
-- SCRIPT COMPLETO PARA LIMPAR MÉTRICAS E TRANSACÕES
-- Execute este script no Supabase SQL Editor
-- ============================================

-- 1. Criar política RLS para DELETE (se não existir)
DROP POLICY IF EXISTS "Permitir exclusão pública de transações" ON public.transactions;

CREATE POLICY "Permitir exclusão pública de transações"
ON public.transactions
FOR DELETE
TO anon, authenticated
USING (true);

-- 2. Criar função RPC para deletar todas as transações (bypassa RLS)
CREATE OR REPLACE FUNCTION delete_all_transactions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.transactions;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- 3. Permitir que anon e authenticated executem esta função
GRANT EXECUTE ON FUNCTION delete_all_transactions() TO anon, authenticated;

-- 4. Testar a função (opcional - descomente para testar)
-- SELECT delete_all_transactions();

-- 5. Verificar quantas transações existem
SELECT COUNT(*) as total_transacoes FROM public.transactions;

-- 6. Verificar se a política foi criada
SELECT 
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE tablename = 'transactions' AND cmd = 'DELETE';

