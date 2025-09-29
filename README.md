# 🚀 ERP de Gestão de Pagamentos

Sistema completo de gestão de clientes, contratos e pagamentos desenvolvido com React Native (frontend) e Node.js (backend), utilizando Supabase como banco de dados.

## 📋 Funcionalidades

### 📱 Frontend (React Native)
- **Autenticação**: Login seguro com JWT
- **Gestão de Clientes**: Cadastro, edição, listagem e visualização detalhada
- **Gestão de Contratos**: Criação e gerenciamento de contratos vinculados aos clientes
- **Gestão de Pagamentos**: Controle completo de pagamentos com filtros por status
- **Dashboard**: Estatísticas em tempo real com gráficos e métricas
- **Navegação Intuitiva**: Fluxo cliente → contrato → pagamentos

### ⚙️ Backend (Node.js)
- **API REST**: Endpoints padronizados para todas as entidades
- **Arquitetura em Camadas**: Controllers, Services, Repositories
- **Autenticação JWT**: Sistema seguro de autenticação
- **Validação de Dados**: Middleware de validação e tratamento de erros
- **ORM Prisma**: Integração otimizada com Supabase

### 🗄️ Banco de Dados (Supabase)
- **PostgreSQL**: Banco robusto e escalável
- **Relacionamentos**: Foreign keys entre clientes, contratos e pagamentos
- **UUIDs**: Chaves primárias seguras
- **Timestamps**: Controle de criação e atualização

## 🏗️ Arquitetura

```
finance-app/
├── backend/                 # API Node.js
│   ├── src/
│   │   ├── controllers/     # Controladores das rotas
│   │   ├── services/        # Regras de negócio
│   │   ├── repositories/    # Acesso ao banco de dados
│   │   ├── models/          # Modelos Prisma
│   │   ├── middleware/      # Middlewares (auth, logs, etc)
│   │   └── routes/          # Definição das rotas
│   ├── prisma/              # Schema e migrations
│   └── tests/               # Testes unitários e integração
└── frontend/                # App React Native
    ├── src/
    │   ├── screens/         # Telas da aplicação
    │   ├── components/      # Componentes reutilizáveis
    │   ├── services/        # Integração com API
    │   ├── hooks/           # Hooks customizados
    │   ├── navigation/      # Configuração de rotas
    │   └── styles/          # Estilos globais
    └── __tests__/           # Testes do frontend
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- React Native CLI
- Conta no Supabase

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npx react-native run-ios    # iOS
npx react-native run-android # Android
```

## 🔧 Configuração

### Variáveis de Ambiente
Crie um arquivo `.env` no backend com:
```
DATABASE_URL="sua_url_do_supabase"
JWT_SECRET="seu_jwt_secret"
SUPABASE_URL="sua_url_do_supabase"
SUPABASE_ANON_KEY="sua_chave_anonima"
```

### Banco de Dados
O projeto utiliza as seguintes tabelas no Supabase:
- `clients`: Informações dos clientes
- `contracts`: Contratos vinculados aos clientes
- `payments`: Pagamentos dos contratos

## 🧪 Testes
```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

## 📊 Dashboard
O dashboard inclui:
- Total de clientes ativos
- Contratos em andamento
- Pagamentos pendentes/atrasados
- Receita total do mês
- Gráficos de performance

## 🔮 Próximas Funcionalidades
- [ ] Integração com Stripe/PayPal
- [ ] Notificações push para pagamentos
- [ ] Relatórios em PDF
- [ ] Sistema de backup automático
- [ ] App web (React.js)

## 📝 Licença
Este projeto está sob a licença MIT.