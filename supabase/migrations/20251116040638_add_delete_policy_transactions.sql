-- Adicionar política RLS para DELETE na tabela transactions
-- Permitir DELETE para anon (necessário para limpar métricas)

DROP POLICY IF EXISTS "Permitir exclusão pública de transações" ON public.transactions;

CREATE POLICY "Permitir exclusão pública de transações"
ON public.transactions
FOR DELETE
TO anon, authenticated
USING (true);

