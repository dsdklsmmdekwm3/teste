# 🔧 Como Corrigir as Permissões do Banco de Dados

## ⚠️ Problema
Ao tentar criar um novo upsell no painel admin, aparece o erro:
> "Não foi possível criar novo upsell. Verifique as permissões do banco de dados"

## ✅ Solução

### Passo 1: Acesse o Supabase Dashboard
1. Vá para https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione o projeto do seu site

### Passo 2: Abra o SQL Editor
1. No menu lateral, clique em **"SQL Editor"**
2. Clique em **"New query"**

### Passo 3: Execute o Script de Correção
1. Abra o arquivo `supabase/fix_upsell_permissions.sql` neste projeto
2. **Copie TODO o conteúdo** do arquivo
3. **Cole no SQL Editor** do Supabase
4. Clique em **"Run"** ou pressione `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

### Passo 4: Verificar se Funcionou
Após executar o script, você deve ver:
- ✅ Mensagem de sucesso
- ✅ Lista dos upsells existentes (se houver)

### Passo 5: Testar no Painel Admin
1. Volte para o painel admin do seu site
2. Vá na aba **"Upsells"**
3. Clique em **"Adicionar Upsell"**
4. Agora deve funcionar! 🎉

## 📋 O que o Script Faz?

O script SQL:
1. ✅ Remove todas as políticas antigas que podem estar causando conflito
2. ✅ Cria novas políticas RLS (Row Level Security) corretas para:
   - SELECT (ler upsells)
   - INSERT (criar upsells)
   - UPDATE (editar upsells)
   - DELETE (excluir upsells)
3. ✅ Cria um upsell padrão se a tabela estiver vazia
4. ✅ Mostra todos os upsells existentes

## 🔍 Verificar Políticas Manualmente

Se quiser verificar as políticas existentes, execute:

```sql
SELECT * FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'upsell_config';
```

Você deve ver 4 políticas:
- `upsell_config_select_policy`
- `upsell_config_insert_policy`
- `upsell_config_update_policy`
- `upsell_config_delete_policy`

## ❓ Ainda com Problemas?

Se ainda não funcionar:
1. Verifique se o RLS está habilitado na tabela:
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' 
     AND tablename = 'upsell_config';
   ```

2. Verifique se as políticas foram criadas:
   ```sql
   SELECT policyname, cmd, roles 
   FROM pg_policies 
   WHERE schemaname = 'public' 
     AND tablename = 'upsell_config';
   ```

3. Tente desabilitar temporariamente o RLS (apenas para teste):
   ```sql
   ALTER TABLE public.upsell_config DISABLE ROW LEVEL SECURITY;
   ```
   ⚠️ **ATENÇÃO**: Reative o RLS depois com:
   ```sql
   ALTER TABLE public.upsell_config ENABLE ROW LEVEL SECURITY;
   ```

## 📞 Suporte

Se o problema persistir, verifique:
- ✅ Se você está usando a URL e chave corretas do Supabase
- ✅ Se as variáveis de ambiente estão configuradas corretamente
- ✅ Se há erros no console do navegador (F12)

