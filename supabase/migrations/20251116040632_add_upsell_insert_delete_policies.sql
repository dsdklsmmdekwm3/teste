-- Adicionar políticas de INSERT e DELETE para upsell_config
-- Isso permite que o painel admin crie e exclua upsells

CREATE POLICY "Permitir inserção pública de upsells" ON public.upsell_config 
FOR INSERT TO anon 
WITH CHECK (true);

CREATE POLICY "Permitir exclusão pública de upsells" ON public.upsell_config 
FOR DELETE TO anon 
USING (true);

