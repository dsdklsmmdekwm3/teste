# Sistema de Armazenamento Local

Este projeto agora suporta armazenamento local sem dependência de banco de dados externo.

## Como Funciona

### 1. **LocalStorage (Cliente)**
- Todos os dados são salvos no `localStorage` do navegador
- Funciona offline e sem servidor
- Limite: ~5-10MB por domínio

### 2. **API Routes (Vercel)**
- Quando hospedado no Vercel, os dados são sincronizados com arquivos JSON
- API route em `/api/data.ts` gerencia o armazenamento
- Dados salvos em `.data/app-data.json`

## Configuração

### Ativar/Desativar LocalStorage

Edite `src/lib/storage-config.ts`:

```typescript
export const USE_LOCAL_STORAGE = true; // true = localStorage, false = Supabase
```

## Estrutura de Dados

Os dados são armazenados em:

```json
{
  "transactions": [],
  "site_config": [],
  "upsell_config": [],
  "blocked_ips": []
}
```

## Backup e Restauração

### Exportar Dados
```typescript
import { exportData } from '@/lib/local-storage';
const json = exportData();
// Salvar o JSON em um arquivo
```

### Importar Dados
```typescript
import { importData } from '@/lib/local-storage';
const jsonString = '...'; // Ler do arquivo
importData(jsonString);
```

## Deploy no Vercel

1. Faça push do código para o GitHub
2. Conecte o repositório no Vercel
3. O Vercel automaticamente criará as API routes
4. Os dados serão salvos em `.data/app-data.json`

## Limitações

- **LocalStorage**: Limitado a ~5-10MB, apenas no navegador
- **API Routes**: Funciona apenas no Vercel (ou servidor Node.js)
- **Sem sincronização entre dispositivos**: Cada navegador tem seus próprios dados

## Migração de Supabase

Para migrar dados do Supabase:

1. Exporte os dados do Supabase
2. Use `importData()` para importar
3. Ou edite `storage-config.ts` para `USE_LOCAL_STORAGE = true`

## Desenvolvimento Local

Durante desenvolvimento, tudo funciona com localStorage. A API route só é necessária quando você quiser sincronizar entre sessões no Vercel.

