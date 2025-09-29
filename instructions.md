# 🚀 Prompt para o TRAE – ERP de Gestão de Pagamentos

Quero que você desenvolva um **ERP de gestão de pagamentos** com as seguintes especificações técnicas e funcionais:

---

## 📱 Frontend
- Framework: **React Native**
- Funcionalidades principais:
  - Tela de **login e autenticação**
  - Tela de **clientes**:
    - Cadastro, edição e listagem
    - Visualização detalhada de cliente
  - Tela de **contratos**:
    - Cadastro, edição e listagem
    - Relacionar contratos ao cliente
    - Visualização detalhada do contrato
  - Tela de **pagamentos**:
    - Cadastro e edição de pagamentos
    - Listagem com filtros por status (pendente, pago, atrasado)
    - Atualização de status de pagamento
  - Navegação entre clientes → contratos → pagamentos
  - Filtros dinâmicos com badges (removíveis)

---

## ⚙️ Backend
- Linguagem: **Node.js**
- Banco de dados: **Supabase (PostgreSQL)**
- ORM recomendado: Prisma ou Sequelize
- Estrutura de API REST:
  - **/clients**
  - **/contracts**
  - **/payments**
- Cada endpoint deve seguir boas práticas de CRUD, autenticação via JWT e middleware de validação.

---

## 📐 Arquitetura e Padrões
- Arquitetura orientada a objetos (OO)
- Separação em camadas:
  - **Controllers** (entrada das requisições)
  - **Services** (regras de negócio)
  - **Repositories** (acesso ao banco via Supabase/ORM)
  - **Models** (representação das entidades)
- Middleware para logs e autenticação
- Testes unitários e de integração (Jest)

---

## 🌟 Extras
- Dashboard com **estatísticas**:
  - Clientes ativos
  - Contratos em andamento
  - Pagamentos pendentes/atrasados
  - Total recebido no mês
- Notificações de pagamento atrasado
- Integração futura com **Stripe ou PayPal**

---

## 🗄️ Estrutura do Banco de Dados (já existente)

```sql
CREATE TABLE public.clients (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text,
  email text,
  phone text,
  mobile text,
  tax_id text,
  birth_date date,
  address text,
  city text,
  state text,
  postal_code text,
  country text,
  notes text,
  status text,
  external_id text UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT clients_pkey PRIMARY KEY (id)
);

CREATE TABLE public.contracts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  client_id uuid,
  contract_number text,
  description text,
  value numeric DEFAULT NULL::numeric,
  start_date date,
  end_date date,
  status text,
  payment_frequency text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  down_payment numeric,
  number_of_payments numeric,
  CONSTRAINT contracts_pkey PRIMARY KEY (id),
  CONSTRAINT contracts_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id)
);

CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  contract_id uuid,
  amount numeric NOT NULL,
  due_date date,
  paid_date date,
  status text,
  payment_method text,
  notes text,
  external_id text UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  payment_type text,
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES public.contracts(id)
);

🎯 Objetivo: Criar um ERP robusto e escalável para gerenciar clientes, contratos e pagamentos de forma eficiente, com frontend em React Native, backend em Node.js e banco de dados Supabase já existente (seguir padrão de tabelas definido).