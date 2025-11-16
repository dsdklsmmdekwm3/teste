-- Script para verificar e corrigir política RLS de DELETE na tabela transactions
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a política existe
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'transactions' AND cmd = 'DELETE';

-- 2. Se não existir, criar a política
DROP POLICY IF EXISTS "Permitir exclusão pública de transações" ON public.transactions;

CREATE POLICY "Permitir exclusão pública de transações"
ON public.transactions
FOR DELETE
TO anon, authenticated
USING (true);

-- 3. Verificar novamente
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'transactions' AND cmd = 'DELETE';

-- 4. Testar se consegue deletar (substitua 'ID_AQUI' por um ID real de teste)
-- DELETE FROM public.transactions WHERE id = 'ID_AQUI';

