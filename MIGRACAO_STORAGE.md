# Guia de Migração para LocalStorage

## Como Ativar o Sistema LocalStorage

### Passo 1: Ativar no código

Edite `src/lib/storage-config.ts` e mude:

```typescript
export const USE_LOCAL_STORAGE = true;
```

### Passo 2: Substituir imports do Supabase

Em todos os arquivos que usam Supabase, substitua:

**Antes:**
```typescript
import { supabaseClient as supabase } from "@/lib/supabase-helpers";
```

**Depois:**
```typescript
import { getStorage } from "@/lib/storage-config";
const supabase = getStorage();
```

### Passo 3: Usar funções do localStorage diretamente (Recomendado)

Ao invés de usar o adapter, use as funções diretas:

```typescript
import * as storage from '@/lib/local-storage';

// Carregar transações
const transactions = storage.getTransactions();

// Salvar transação
storage.saveTransaction({
  name: 'João',
  email: 'joao@email.com',
  // ...
});

// Configurações
storage.setSiteConfig('product_price', '67.00');
const price = storage.getSiteConfig('product_price');
```

## Estrutura de Dados

Todos os dados ficam em `localStorage` com a chave `app_data`:

```json
{
  "transactions": [
    {
      "id": "123",
      "name": "João",
      "email": "joao@email.com",
      "total_value": 67.00,
      "status": "pending",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "site_config": [
    {
      "key": "product_price",
      "value": "67.00",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "upsell_config": [
    {
      "id": "upsell-1",
      "title": "Oferta Especial",
      "price": "197,00",
      "active": true
    }
  ],
  "blocked_ips": [
    {
      "id": "block-1",
      "ip_address": "192.168.1.1",
      "active": true
    }
  ]
}
```

## Backup e Restauração

### Exportar Dados

```typescript
import { exportData } from '@/lib/local-storage';

// No console do navegador ou em um botão admin
const json = exportData();
console.log(json);
// Copie o JSON e salve em um arquivo
```

### Importar Dados

```typescript
import { importData } from '@/lib/local-storage';

// Cole o JSON exportado
const jsonString = `{...}`;
importData(jsonString);
```

## Limitações

1. **Apenas no navegador**: Cada navegador tem seus próprios dados
2. **Limite de tamanho**: ~5-10MB por domínio
3. **Sem sincronização**: Dados não são compartilhados entre dispositivos
4. **Perda ao limpar cache**: Se o usuário limpar o cache, os dados são perdidos

## Solução para Produção (Vercel)

Para persistência real no Vercel, você tem 3 opções:

### Opção 1: Vercel KV (Recomendado)
- Redis gerenciado pelo Vercel
- Gratuito até 256MB
- Sincronização automática

### Opção 2: Vercel Blob Storage
- Armazenamento de arquivos
- Gratuito até 1GB
- Ideal para backups

### Opção 3: GitHub como Storage
- Salvar dados em um repositório privado
- Usar GitHub API para ler/escrever
- Gratuito e ilimitado

## Exemplo de Uso Completo

```typescript
import * as storage from '@/lib/local-storage';

// Carregar todos os dados
const data = storage.loadLocalData();

// Trabalhar com transações
const transactions = storage.getTransactions();
storage.saveTransaction({ name: 'João', email: 'joao@email.com' });
storage.updateTransaction('id-123', { status: 'paid' });

// Trabalhar com configurações
storage.setSiteConfig('product_price', '67.00');
const price = storage.getSiteConfig('product_price')?.value;

// Trabalhar com upsells
const upsells = storage.getUpsells();
storage.saveUpsell({ title: 'Oferta', price: '197,00' });
storage.deleteUpsell('upsell-id');

// Trabalhar com IPs bloqueados
const blockedIPs = storage.getBlockedIPs();
storage.blockIP({ ip_address: '192.168.1.1', active: true });
storage.unblockIP('block-id');
```

## Migração de Dados do Supabase

Se você já tem dados no Supabase:

1. Exporte os dados do Supabase Dashboard
2. Converta para o formato do localStorage
3. Use `importData()` para importar

Ou crie um script de migração:

```typescript
// Script de migração (executar uma vez)
async function migrateFromSupabase() {
  // Buscar dados do Supabase
  const { data: transactions } = await supabase.from('transactions').select('*');
  const { data: configs } = await supabase.from('site_config').select('*');
  
  // Importar para localStorage
  importData(JSON.stringify({
    transactions: transactions || [],
    site_config: configs || [],
    upsell_config: [],
    blocked_ips: []
  }));
}
```

