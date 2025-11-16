# 🚀 Sistema PIX - Funciona Automaticamente em Localhost e Vercel

## ✅ O que foi implementado:

Sistema **100% automático** que funciona tanto em **localhost** quanto no **Vercel**, sem necessidade de configuração adicional!

### Como funciona:

1. **Em Localhost:**
   - Tenta usar servidor local (`http://localhost:3000`)
   - Se não estiver disponível, usa rotas do Vercel (`/api/pix/*`)
   - Se falhar, chama PushinPay diretamente (fallback)

2. **No Vercel:**
   - Usa automaticamente as rotas `/api/pix/*`
   - Funciona sem configuração adicional

## 📋 Arquivos Criados:

- `src/lib/pix-api.ts` - Helper que detecta ambiente automaticamente
- `api/pix/create.ts` - Rota Vercel para criar PIX
- `api/pix/check-by-pixid/[id].ts` - Rota Vercel para verificar status
- `server.js` - Servidor Express para desenvolvimento local

## 🎯 Como Usar:

### Opção 1: Apenas Frontend (Recomendado)
```bash
npm run dev
```
O sistema tentará usar as rotas do Vercel automaticamente. Se você estiver no Vercel, funcionará perfeitamente!

### Opção 2: Frontend + API Local (Para desenvolvimento completo)
```bash
# Terminal 1 - API
npm run dev:api

# Terminal 2 - Frontend  
npm run dev
```

### Opção 3: Tudo junto
```bash
npm run dev:all
```

## 🔧 Configuração do Webhook (Opcional)

O webhook é usado para receber notificações quando o pagamento é confirmado.

### Opção 1: Variável de Ambiente (Recomendado)
```bash
# No Vercel, adicione:
WEBHOOK_URL=https://webhook.site/seu-codigo-unico
```

### Opção 2: Editar arquivos
Edite `server.js` e `api/pix/create.ts` na linha do `WEBHOOK_URL`

### Gerar Webhook:
1. Acesse: https://webhook.site/#!/new
2. Copie o URL único gerado
3. Use como `WEBHOOK_URL`

## 📡 API Endpoints

### Criar PIX
```typescript
POST /api/pix/create
{
  "value": 6700  // valor em centavos
}

Resposta:
{
  "id": "uuid",
  "copiaCola": "000201010212...",
  "qrCode": "data:image/png;base64,..."
}
```

### Verificar Status
```typescript
GET /api/pix/check-by-pixid/:id

Resposta:
{
  "id": "uuid",
  "status": "paid" | "pending" | "created" | "waiting",
  "value": 6700,
  "paid_at": "2025-11-14T23:09:00Z"
}
```

## 🔑 Token da API

O token está configurado automaticamente:
```
54012|Mcl3CB1BHZT6IS0GLtEpn86ex6c4i8WS3W8gQZmdf454d103
```

## 🐛 Troubleshooting

### Código PIX não aparece
1. Abra o console do navegador (F12)
2. Verifique se há erros
3. O sistema tentará automaticamente diferentes métodos

### Erro 404
- Em localhost: Certifique-se de que `npm run dev:api` está rodando
- No Vercel: As rotas funcionam automaticamente

### Erro CORS
- O sistema usa fallback automático
- Se persistir, verifique o token da API

## ✨ Vantagens

✅ **Zero configuração** - Funciona automaticamente  
✅ **Multi-ambiente** - Localhost e Vercel  
✅ **Fallback inteligente** - Tenta múltiplas opções  
✅ **Fácil deploy** - Funciona no Vercel sem mudanças  

## 📝 Notas

- O sistema detecta automaticamente o ambiente
- Não precisa configurar nada para funcionar
- O webhook é opcional (mas recomendado)
- Funciona offline em desenvolvimento (com servidor local)

