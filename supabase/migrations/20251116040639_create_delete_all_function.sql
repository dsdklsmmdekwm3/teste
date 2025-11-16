-- Criar função RPC para deletar todas as transações
-- Esta função bypassa RLS usando SECURITY DEFINER

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

-- Permitir que anon e authenticated executem esta função
GRANT EXECUTE ON FUNCTION delete_all_transactions() TO anon, authenticated;

