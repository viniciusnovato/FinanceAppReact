# 🚀 Guia de Deploy na Vercel - ERP de Gestão de Pagamentos

Este guia explica como fazer o deploy completo do projeto (frontend e backend) na Vercel.

## 📋 Pré-requisitos

1. Conta na [Vercel](https://vercel.com)
2. Conta no [GitHub](https://github.com) (para conectar o repositório)
3. Banco de dados Supabase configurado
4. Variáveis de ambiente configuradas

## 🔧 Configuração do Backend

### 1. Estrutura de Arquivos Criada

- `backend/vercel.json` - Configuração da Vercel para serverless functions
- `backend/api/index.ts` - Ponto de entrada para serverless function
- `backend/package.json` - Atualizado com script `vercel-build`

### 2. Deploy do Backend

1. **Criar novo projeto na Vercel:**
   - Acesse [vercel.com](https://vercel.com)
   - Clique em "New Project"
   - Conecte seu repositório GitHub
   - Selecione a pasta `backend` como root directory

2. **Configurar variáveis de ambiente:**
   ```
   SUPABASE_URL=sua_url_do_supabase
   SUPABASE_ANON_KEY=sua_chave_anonima
   SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
   JWT_SECRET=sua_chave_jwt_secreta
   JWT_EXPIRES_IN=7d
   NODE_ENV=production
   PORT=3000
   ```

3. **Configurações do projeto:**
   - Framework Preset: `Other`
   - Root Directory: `backend`
   - Build Command: `npm run vercel-build`
   - Output Directory: `dist`

## 🎨 Configuração do Frontend

### 1. Estrutura de Arquivos Criada

- `FinanceERP/vercel.json` - Configuração da Vercel para React Native Web
- `FinanceERP/package.json` - Atualizado com scripts de build web
- `FinanceERP/.env.example` - Exemplo de variáveis de ambiente

### 2. Deploy do Frontend

1. **Criar novo projeto na Vercel:**
   - Acesse [vercel.com](https://vercel.com)
   - Clique em "New Project"
   - Conecte seu repositório GitHub
   - Selecione a pasta `FinanceERP` como root directory

2. **Configurar variáveis de ambiente:**
   ```
   REACT_APP_API_BASE_URL=https://seu-backend.vercel.app/api
   NODE_ENV=production
   ```

3. **Configurações do projeto:**
   - Framework Preset: `React`
   - Root Directory: `FinanceERP`
   - Build Command: `npm run vercel-build`
   - Output Directory: `dist`

## 🔗 Conectando Frontend e Backend

### 1. Atualizar URLs

Após o deploy do backend, você receberá uma URL como `https://seu-backend.vercel.app`

1. **No frontend (`FinanceERP/src/services/api.ts`):**
   - A URL já está configurada para usar variável de ambiente
   - Atualize a URL de produção na linha 4-5

2. **No backend (`backend/api/index.ts`):**
   - Adicione o domínio do frontend no CORS (linha 18-25)

### 2. Configurar CORS

No arquivo `backend/api/index.ts`, atualize as origens permitidas:

```typescript
origin: [
  'http://localhost:8081',
  'http://localhost:3000',
  'https://seu-frontend.vercel.app', // Adicione sua URL do frontend
  'https://*.vercel.app'
],
```

## 🔐 Variáveis de Ambiente

### Backend (.env na Vercel)
```
SUPABASE_URL=sua_url_do_supabase
SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
JWT_SECRET=sua_chave_jwt_muito_segura
JWT_EXPIRES_IN=7d
NODE_ENV=production
```

### Frontend (.env na Vercel)
```
REACT_APP_API_BASE_URL=https://seu-backend.vercel.app/api
NODE_ENV=production
```

## 🧪 Testando o Deploy

### 1. Testar Backend
```bash
curl https://seu-backend.vercel.app/api/health
```

### 2. Testar Frontend
- Acesse `https://seu-frontend.vercel.app`
- Faça login com suas credenciais
- Teste as funcionalidades principais

## 🚨 Troubleshooting

### Problemas Comuns

1. **CORS Error:**
   - Verifique se o domínio do frontend está nas origens permitidas do backend
   - Certifique-se de que as URLs estão corretas (https vs http)

2. **API não encontrada:**
   - Verifique se `REACT_APP_API_BASE_URL` está configurada corretamente
   - Confirme se o backend está funcionando acessando `/api/health`

3. **Erro de autenticação:**
   - Verifique se `JWT_SECRET` está configurado no backend
   - Confirme se as variáveis do Supabase estão corretas

4. **Build falha:**
   - Verifique se todas as dependências estão no `package.json`
   - Confirme se os scripts de build estão corretos

### Logs e Debug

- **Backend:** Acesse os logs na dashboard da Vercel
- **Frontend:** Use o console do navegador para debug
- **Database:** Verifique os logs no Supabase

## 📝 Próximos Passos

1. **Domínio personalizado:** Configure um domínio próprio na Vercel
2. **SSL:** A Vercel fornece SSL automaticamente
3. **Monitoramento:** Configure alertas e monitoramento
4. **CI/CD:** Configure deploy automático via GitHub

## 🔄 Atualizações

Para atualizar a aplicação:

1. Faça push das alterações para o GitHub
2. A Vercel fará deploy automático
3. Teste as alterações nos ambientes de produção

---

**Importante:** Substitua todas as URLs de exemplo (`seu-backend.vercel.app`, `seu-frontend.vercel.app`) pelas URLs reais geradas pela Vercel após o deploy.