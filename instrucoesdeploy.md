### 🎯 Objetivo
Executar o deploy completo de uma aplicação **full stack** (frontend em React Native Web + backend em Node.js) conectada ao **Supabase**, utilizando os **MCPs da Vercel e do Supabase**, com **checkpoints automáticos** a cada etapa.

---

### 🧠 Instruções detalhadas para o TRAE AI

1. **Análise inicial do repositório**
   - Analise **toda a estrutura** do projeto Git aberto neste workspace.
   - Identifique e classifique as partes do projeto:
     - **Frontend:** React Native Web (verifique se é Expo Web, CRA, ou outro setup)
     - **Backend:** Node.js (Express, Next.js API, ou outro framework)
     - **Banco:** Supabase (já disponível via API key)
   - Liste as dependências, arquivos `.env`, `package.json`, e `vercel.json`.
   - Detecte se há configurações de monorepo ou pastas separadas (`/frontend`, `/backend`, etc).

---

2. **Planejamento do deploy unificado**
   - Estruture o projeto para deploy **em um único projeto da Vercel**, com:
     - Frontend sendo servido como app principal.
     - Backend em **funções serverless** (pasta `/api` ou `/backend`).
   - Mantenha o Supabase como serviço externo — **não recriar nem migrar** o banco.
   - Confirme a compatibilidade com MCP ativo da Vercel e Supabase.

---

3. **Validação de variáveis de ambiente**
   - Antes de iniciar o build, verifique se as seguintes variáveis estão configuradas e acessíveis:
     - `SUPABASE_URL`
     - `SUPABASE_ANON_KEY`
     - (opcional) `SUPABASE_SERVICE_ROLE_KEY`
     - `NODE_ENV`
     - `VERCEL_ENV`
   - Teste a conexão com o Supabase (ex.: `select 1` no banco via API) para validar a chave.
   - Caso alguma variável esteja ausente ou inválida, interrompa o processo e exiba aviso com instruções.

---

4. **Divisão do deploy em etapas com checkpoints**
   Execute o processo **em etapas independentes**, criando um **checkpoint automático** ao final de cada fase.  
   Caso uma etapa falhe, o TRAE deve **retomar a partir do último checkpoint válido**, sem reiniciar o fluxo completo.

   #### 🧩 Etapa 1 — Ambiente e dependências
   - Validar `package.json` de frontend e backend.
   - Rodar `npm install` / `pnpm install`.
   - Confirmar builds locais (`npm run build`).
   - Criar **checkpoint #1** após a validação.

   #### 🧩 Etapa 2 — Build e teste do frontend
   - Compilar o frontend (React Native Web).
   - Testar no ambiente de preview local.
   - Confirmar rotas e assets.
   - Criar **checkpoint #2** após sucesso.

   #### 🧩 Etapa 3 — Backend / API
   - Testar rotas (GET, POST) localmente.
   - Validar integração com o Supabase.
   - Gerar logs de resposta das rotas.
   - Criar **checkpoint #3**.

   #### 🧩 Etapa 4 — Integração com Supabase
   - Testar queries e autenticação via API key.
   - Confirmar conexão segura e estável.
   - Criar **checkpoint #4**.

   #### 🧩 Etapa 5 — Deploy final na Vercel
   - Deployar frontend e backend no mesmo projeto.
   - Validar ambiente de produção (`VERCEL_ENV=production`).
   - Testar URLs finais.
   - Criar **checkpoint #5 (deploy concluído)**.

---

5. **Testes automáticos após cada etapa**
   - Validar build e logs.
   - Confirmar resposta de APIs e Supabase.
   - Caso falhe, gerar relatório de erro e retomar do último checkpoint salvo.

---

6. **Relatório final**
   Ao concluir, gere um **relatório completo** com:
   - Estrutura final do projeto (pastas e rotas)
   - URLs públicas de frontend e backend
   - Status de cada checkpoint
   - Resultados dos testes e logs
   - Sugestões de otimização (build, segurança, CORS, cache, etc.)

---

### ⚙️ Contexto técnico
- **Frontend:** React Native Web (Expo Web ou CRA)
- **Backend:** Node.js (Express, Next.js API ou Fastify)
- **Banco:** Supabase (PostgreSQL + Auth) via API key
- **Infra:** Vercel (deploy unificado com MCPs ativos)
- **Repositório Git:** já conectado ao projeto TRAE
- **Objetivo final:** Deploy único com rollback e checkpoints automáticos

---

### ✅ Resultado esperado
- Deploy 100% funcional em um único projeto da Vercel  
- Checkpoints salvos em cada fase (ambiente, frontend, backend, Supabase, deploy)  
- Logs e status claros para auditoria e rollback  
- Integração contínua entre frontend, backend e Supabase confirmada
