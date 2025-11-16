-- Garantir que as políticas de INSERT e DELETE existam
-- Se já existirem, não dará erro devido ao IF NOT EXISTS implícito

-- Remover políticas antigas se existirem (para evitar conflitos)
DROP POLICY IF EXISTS "Permitir inserção pública de upsells" ON public.upsell_config;
DROP POLICY IF EXISTS "Permitir exclusão pública de upsells" ON public.upsell_config;

-- Criar políticas de INSERT e DELETE
CREATE POLICY "Permitir inserção pública de upsells" ON public.upsell_config 
FOR INSERT TO anon 
WITH CHECK (true);

CREATE POLICY "Permitir exclusão pública de upsells" ON public.upsell_config 
FOR DELETE TO anon 
USING (true);

-- Inserir upsell padrão se não existir nenhum
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
  END IF;
END $$;

