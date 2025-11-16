-- Inserir upsell padrão diretamente no banco de dados
-- Isso garante que sempre haverá pelo menos um upsell disponível

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
) ON CONFLICT DO NOTHING;

