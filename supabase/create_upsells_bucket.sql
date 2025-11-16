-- Script para criar o bucket 'upsells' no Supabase Storage
-- Execute este script no SQL Editor do Supabase

-- Criar o bucket (se não existir)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'upsells',
  'upsells',
  true, -- Público para permitir acesso às imagens
  5242880, -- 5MB limite
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Criar política para permitir upload público (opcional - para uploads anônimos)
-- Se você quiser que apenas usuários autenticados façam upload, remova esta política
CREATE POLICY "Permitir upload público de imagens de upsells"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'upsells' AND
  (storage.foldername(name))[1] = 'upsells'
);

-- Criar política para permitir leitura pública
CREATE POLICY "Permitir leitura pública de imagens de upsells"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'upsells');

-- Criar política para permitir atualização (para substituir imagens)
CREATE POLICY "Permitir atualização de imagens de upsells"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'upsells')
WITH CHECK (bucket_id = 'upsells');

-- Criar política para permitir exclusão
CREATE POLICY "Permitir exclusão de imagens de upsells"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'upsells');

