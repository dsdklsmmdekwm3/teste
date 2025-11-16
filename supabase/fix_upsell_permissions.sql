-- ============================================
-- SCRIPT PARA CORRIGIR PERMISSÕES E CRIAR UPSELL PADRÃO
-- Execute este script no SQL Editor do Supabase Dashboard
-- ============================================

-- 1. Remover TODAS as políticas antigas (para evitar conflitos)
DROP POLICY IF EXISTS "Permitir inserção pública de upsells" ON public.upsell_config;
DROP POLICY IF EXISTS "Permitir exclusão pública de upsells" ON public.upsell_config;
DROP POLICY IF EXISTS "Permitir inserção pública de configurações" ON public.upsell_config;
DROP POLICY IF EXISTS "Permitir exclusão pública de configurações" ON public.upsell_config;
DROP POLICY IF EXISTS "Permitir atualização pública de configurações" ON public.upsell_config;
DROP POLICY IF EXISTS "Permitir leitura pública de configurações" ON public.upsell_config;
DROP POLICY IF EXISTS "upsell_config_select_policy" ON public.upsell_config;
DROP POLICY IF EXISTS "upsell_config_insert_policy" ON public.upsell_config;
DROP POLICY IF EXISTS "upsell_config_update_policy" ON public.upsell_config;
DROP POLICY IF EXISTS "upsell_config_delete_policy" ON public.upsell_config;

-- 2. Criar políticas completas e corretas
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

-- 3. Inserir upsell padrão se não existir nenhum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.upsell_config LIMIT 1) THEN
    INSERT INTO public.upsell_config (
      title,
      description,
      price,
      original_price,
      image_url,
      "order",
      active
    ) VALUES (
      'Oferta Especial: Consultoria Individual 1h',
      'Tenha 1 sessão por semana, com cronograma de dieta e rotina 100% personalizado. Acompanhamento contínuo, ajustes semanais e acesso vitalício enquanto mantiver sua vaga. Transforme seu corpo e sua disciplina com orientação real e personalizada.',
      '197,00',
      '297,00',
      'https://via.placeholder.com/200x200',
      1,
      true
    );
    RAISE NOTICE 'Upsell padrão criado com sucesso!';
  ELSE
    RAISE NOTICE 'Já existe pelo menos um upsell no banco de dados.';
  END IF;
END $$;

-- 4. Verificar se foi criado
SELECT * FROM public.upsell_config ORDER BY "order";

