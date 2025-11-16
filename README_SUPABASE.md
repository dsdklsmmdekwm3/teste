# Configuração do Supabase

Este projeto está configurado para usar **Supabase** como banco de dados principal.

## ✅ Tudo está salvo no Supabase

- ✅ Transações
- ✅ Configurações do site
- ✅ Upsells
- ✅ IPs bloqueados
- ✅ Dados do painel admin

## Configuração

O projeto usa as variáveis de ambiente do Supabase:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_publica
```

## Estrutura do Banco de Dados

### Tabelas:

1. **transactions** - Todas as transações/pedidos
2. **site_config** - Configurações do site (preços, imagens, temas)
3. **upsell_config** - Configuração dos upsells
4. **blocked_ips** - IPs bloqueados

## Como Funciona

Todos os dados são salvos diretamente no Supabase através das funções:

```typescript
import { supabaseClient as supabase } from "@/lib/supabase-helpers";

// Salvar transação
await supabase.from('transactions').insert({...});

// Buscar transações
const { data } = await supabase.from('transactions').select('*');

// Atualizar configuração
await supabase.from('site_config').upsert({...});
```

## Sincronização

- ✅ Dados salvos automaticamente no Supabase
- ✅ Sincronização em tempo real
- ✅ Backup automático pelo Supabase
- ✅ Acessível de qualquer dispositivo

## Migração de Dados

Se você já tem dados no Supabase, eles continuarão funcionando normalmente. Não é necessária nenhuma migração.

