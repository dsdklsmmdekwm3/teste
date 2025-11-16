# 🚀 Instruções para Configurar PIX

## ✅ O que foi feito:

1. **Criadas rotas API internas**:
   - `POST /api/pix/create` - Cria PIX
   - `GET /api/pix/check-by-pixid/:id` - Verifica status

2. **Servidor Express local** (`server.js`):
   - Roda na porta 3000
   - Simula as rotas do Vercel em desenvolvimento

3. **Frontend atualizado**:
   - Usa as rotas internas `/api/pix/*`
   - Exibe código PIX copia e cola
   - Exibe QR Code (se disponível)
   - Botão "Já paguei" funcional

## 📋 Como usar:

### 1. Gerar Webhook (OBRIGATÓRIO)

1. Acesse: https://webhook.site/#!/new
2. Copie o URL único gerado (exemplo: `https://webhook.site/a1b2c3d4-e5f6-7890-abcd-ef1234567890`)
3. Cole nos arquivos:
   - `server.js` (linha 12)
   - `api/pix/create.ts` (linha 7)

### 2. Instalar dependências

```bash
npm install
```

### 3. Iniciar servidores

**Opção 1: Dois terminais separados**
```bash
# Terminal 1 - API
npm run dev:api

# Terminal 2 - Frontend
npm run dev
```

**Opção 2: Um terminal (ambos juntos)**
```bash
npm run dev:all
```

### 4. Acessar

- **Frontend**: http://localhost:8080 (ou porta configurada no Vite)
- **API**: http://localhost:3000

## 🔍 Estrutura da API

### Criar PIX
```bash
POST /api/pix/create
Content-Type: application/json

{
  "value": 6700  // valor em centavos
}
```

**Resposta:**
```json
{
  "id": "uuid-da-transacao",
  "copiaCola": "000201010212...",
  "qrCode": "data:image/png;base64,...",
  "original": { ... }
}
```

### Verificar Status
```bash
GET /api/pix/check-by-pixid/:id
```

**Resposta:**
```json
{
  "id": "uuid-da-transacao",
  "status": "paid" | "pending" | "created" | "waiting",
  "value": 6700,
  "paid_at": "2025-11-14T23:09:00Z"
}
```

## 🐛 Troubleshooting

### Código PIX não aparece
1. Verifique o console do navegador (F12)
2. Verifique se o servidor API está rodando na porta 3000
3. Verifique se o webhook está configurado corretamente

### Erro 404 na API
- Certifique-se de que `npm run dev:api` está rodando
- Verifique se a porta 3000 está livre

### Erro ao criar PIX
- Verifique se o token está correto
- Verifique se o webhook URL está válido
- Veja os logs do servidor API

## 📝 Notas

- O webhook é usado para receber notificações quando o pagamento é confirmado
- Em produção (Vercel), as rotas em `api/pix/*` funcionam automaticamente
- O código PIX (`qr_code`) é o código completo para copiar e colar
- O QR Code (`qr_code_base64`) é a imagem em base64 para escanear

