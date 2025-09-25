# 📱 Plano de Desenvolvimento Frontend – React Native (Aprimorado)

## 🎯 Objetivo
Refatorar completamente o **frontend do Sistema de Gestão Financeira** de Flutter Web para **React Native (Expo)**, mantendo todas as funcionalidades existentes e aproveitando o **backend Node.js** e **banco de dados Supabase** já implementados e funcionais.

---

## 📋 Visão Geral do Projeto

### Sistema Atual (Análise)
- **Backend**: Node.js + Express.js (✅ Pronto)
- **Banco de Dados**: Supabase PostgreSQL (✅ Pronto)
- **Frontend Atual**: Flutter Web (🔄 Para migrar)
- **Autenticação**: Supabase Auth (✅ Integrado)
- **API**: RESTful completa (✅ Funcional)

### Funcionalidades Principais a Migrar
- Dashboard com KPIs avançados
- Gestão de Clientes (CRUD completo)
- Gestão de Contratos (com cronograma de pagamentos)
- Gestão de Pagamentos (controle de parcelas)
- Importação CSV (pipeline completo)
- Relatórios e Análises
- Sistema de Autenticação e Perfis
- Upload de Documentos

---

## 🏗️ Etapa 1: Análise Detalhada da Arquitetura Atual e Requisitos

### 1.1 Mapeamento da Arquitetura Existente

#### Backend (Já Implementado)
```
backend/
├── src/
│   ├── config/          # Configurações Supabase
│   ├── middleware/      # Auth, CORS, Validação
│   ├── routes/          # Endpoints REST
│   │   ├── auth.js      # Autenticação
│   │   ├── clients.js   # Gestão de clientes
│   │   ├── contracts.js # Gestão de contratos
│   │   ├── payments.js  # Gestão de pagamentos
│   │   └── dashboard.js # KPIs e relatórios
│   ├── utils/           # Funções auxiliares
│   └── validators/      # Validação de dados
```

#### Endpoints Disponíveis
- **Auth**: `/api/auth/login`, `/api/auth/register`, `/api/auth/profile`
- **Clients**: `/api/clients` (GET, POST, PUT, DELETE)
- **Contracts**: `/api/contracts` (GET, POST, PUT, DELETE)
- **Payments**: `/api/payments` (GET, POST, PUT, DELETE)
- **Dashboard**: `/api/dashboard/kpis`, `/api/dashboard/charts`
- **Upload**: `/api/upload/csv`, `/api/upload/documents`

### 1.2 Análise de Requisitos Funcionais

#### Módulos Principais
1. **Autenticação e Perfis**
   - Login/Logout com Supabase Auth
   - Perfis: admin, manager, user, viewer
   - Recuperação de senha
   - Gestão de sessão

2. **Dashboard Executivo**
   - KPIs: Receita Total, MRR, ARR, LTV
   - Taxa de Inadimplência
   - Gráficos interativos
   - Filtros por período e filial

3. **Gestão de Clientes**
   - CRUD completo
   - Busca avançada
   - Validação CPF/CNPJ
   - Histórico de contratos

4. **Gestão de Contratos**
   - Criação com cronograma automático
   - Upload de documentos
   - Status: draft, active, completed, cancelled
   - Cálculo de juros e parcelas

5. **Gestão de Pagamentos**
   - Cronograma de parcelas
   - Registro de pagamentos
   - Controle de inadimplência
   - Múltiplos métodos de pagamento

6. **Importação CSV**
   - Upload e validação
   - Normalização de dados
   - Mapeamento automático
   - Relatório de importação

### 1.3 Requisitos Não-Funcionais

#### Performance
- Carregamento inicial < 3s
- Navegação fluida (60fps)
- Lazy loading para listas grandes
- Cache inteligente de dados

#### Segurança
- Autenticação JWT
- Validação client-side
- Sanitização de inputs
- Controle de acesso por role

#### Usabilidade
- Interface responsiva
- Feedback visual imediato
- Offline-first para dados críticos
- Acessibilidade (WCAG 2.1)

---

## 🎨 Etapa 2: Definição da Nova Estrutura de Componentes React Native

### 2.1 Arquitetura de Componentes

```
src/
├── components/
│   ├── ui/                    # Componentes base
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Card/
│   │   ├── Modal/
│   │   ├── Loading/
│   │   └── Toast/
│   ├── forms/                 # Formulários específicos
│   │   ├── ClientForm/
│   │   ├── ContractForm/
│   │   └── PaymentForm/
│   ├── tables/                # Componentes de listagem
│   │   ├── DataTable/
│   │   ├── ClientList/
│   │   ├── ContractList/
│   │   └── PaymentList/
│   ├── charts/                # Gráficos e visualizações
│   │   ├── LineChart/
│   │   ├── PieChart/
│   │   ├── BarChart/
│   │   └── KPICard/
│   └── layout/                # Layout e navegação
│       ├── Header/
│       ├── Sidebar/
│       ├── TabBar/
│       └── Container/
```

### 2.2 Design System

#### Tokens de Design
```javascript
// tokens/colors.js
export const colors = {
  primary: {
    50: '#f0f9ff',
    500: '#3b82f6',
    900: '#1e3a8a'
  },
  gray: {
    50: '#f9fafb',
    500: '#6b7280',
    900: '#111827'
  },
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444'
};

// tokens/typography.js
export const typography = {
  h1: { fontSize: 32, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: 'normal' },
  caption: { fontSize: 12, fontWeight: 'normal' }
};

// tokens/spacing.js
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32
};
```

#### Componentes Base
```javascript
// components/ui/Button/Button.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../../tokens';

export const Button = ({ 
  title, 
  variant = 'primary', 
  size = 'medium',
  onPress,
  disabled = false,
  loading = false 
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        styles[size],
        disabled && styles.disabled
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      <Text style={[styles.text, styles[`text_${variant}`]]}>
        {loading ? 'Carregando...' : title}
      </Text>
    </TouchableOpacity>
  );
};
```

### 2.3 Padrões de Componentes

#### Higher-Order Components (HOCs)
- `withAuth`: Proteção de rotas
- `withLoading`: Estados de carregamento
- `withError`: Tratamento de erros

#### Custom Hooks
- `useAuth`: Gerenciamento de autenticação
- `useApi`: Chamadas para API
- `useForm`: Validação de formulários
- `useDebounce`: Otimização de busca

#### Context Providers
- `AuthProvider`: Estado de autenticação
- `ThemeProvider`: Tema dark/light
- `ApiProvider`: Configuração de API

---

## 🔄 Etapa 3: Planejamento da Migração de Telas e Funcionalidades

### 3.1 Mapeamento de Telas

#### Telas Principais (Flutter → React Native)
1. **Login/Auth**
   - `LoginScreen` → `screens/Auth/LoginScreen.js`
   - `RegisterScreen` → `screens/Auth/RegisterScreen.js`
   - `ForgotPasswordScreen` → `screens/Auth/ForgotPasswordScreen.js`

2. **Dashboard**
   - `DashboardScreen` → `screens/Dashboard/DashboardScreen.js`
   - `KPICards` → `components/charts/KPICard.js`
   - `ChartsSection` → `components/charts/ChartsSection.js`

3. **Clientes**
   - `ClientsListScreen` → `screens/Clients/ClientsListScreen.js`
   - `ClientDetailsScreen` → `screens/Clients/ClientDetailsScreen.js`
   - `ClientFormScreen` → `screens/Clients/ClientFormScreen.js`

4. **Contratos**
   - `ContractsListScreen` → `screens/Contracts/ContractsListScreen.js`
   - `ContractDetailsScreen` → `screens/Contracts/ContractDetailsScreen.js`
   - `ContractFormScreen` → `screens/Contracts/ContractFormScreen.js`

5. **Pagamentos**
   - `PaymentsListScreen` → `screens/Payments/PaymentsListScreen.js`
   - `PaymentDetailsScreen` → `screens/Payments/PaymentDetailsScreen.js`
   - `PaymentFormScreen` → `screens/Payments/PaymentFormScreen.js`

### 3.2 Estratégia de Migração por Prioridade

#### Fase 1: Core (Semanas 1-2)
- Autenticação e navegação base
- Design system e componentes UI
- Integração com API existente

#### Fase 2: Funcionalidades Principais (Semanas 3-5)
- Dashboard com KPIs
- Gestão de Clientes (CRUD)
- Gestão de Contratos básica

#### Fase 3: Funcionalidades Avançadas (Semanas 6-8)
- Gestão completa de Pagamentos
- Importação CSV
- Relatórios e exportação

#### Fase 4: Otimização e Extras (Semanas 9-10)
- Performance e cache
- Funcionalidades mobile específicas
- Testes e refinamentos

### 3.3 Compatibilidade de Dados

#### Modelos de Dados (Manter Compatibilidade)
```javascript
// models/Client.js
export interface Client {
  id: string;
  company_id: string;
  branch_id: string;
  name: string;
  document: string;
  document_type: 'CPF' | 'CNPJ';
  email?: string;
  phone?: string;
  mobile?: string;
  // ... outros campos conforme backend
}

// models/Contract.js
export interface Contract {
  id: string;
  company_id: string;
  branch_id: string;
  client_id: string;
  contract_number: string;
  total_amount: number;
  installments: number;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  // ... outros campos conforme backend
}
```

---

## 📐 Etapa 4: Estabelecimento de Padrões de Código e Estilo

### 4.1 Estrutura de Arquivos

#### Convenções de Nomenclatura
- **Componentes**: PascalCase (`ClientForm.js`)
- **Hooks**: camelCase com prefixo `use` (`useAuth.js`)
- **Utilitários**: camelCase (`formatCurrency.js`)
- **Constantes**: UPPER_SNAKE_CASE (`API_ENDPOINTS.js`)

#### Organização de Pastas
```
src/
├── components/           # Componentes reutilizáveis
├── screens/             # Telas da aplicação
├── navigation/          # Configuração de navegação
├── services/            # Serviços de API
├── hooks/               # Custom hooks
├── context/             # Context providers
├── utils/               # Funções utilitárias
├── constants/           # Constantes da aplicação
├── types/               # Definições TypeScript
└── assets/              # Imagens, ícones, fontes
```

### 4.2 Padrões de Código

#### ESLint + Prettier Configuration
```json
// .eslintrc.js
{
  "extends": [
    "@react-native-community",
    "prettier"
  ],
  "rules": {
    "react-hooks/exhaustive-deps": "warn",
    "no-unused-vars": "error",
    "prefer-const": "error"
  }
}

// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

#### Padrões de Componentes
```javascript
// Estrutura padrão de componente
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

export const ComponentName = ({ prop1, prop2, onAction }) => {
  // 1. Hooks de estado
  const [state, setState] = useState(initialValue);
  
  // 2. Hooks de efeito
  useEffect(() => {
    // lógica de efeito
  }, [dependencies]);
  
  // 3. Funções auxiliares
  const handleAction = () => {
    // lógica da função
    onAction?.();
  };
  
  // 4. Render
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{prop1}</Text>
    </View>
  );
};

// 5. PropTypes
ComponentName.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number,
  onAction: PropTypes.func
};

// 6. Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  text: {
    fontSize: 16,
    color: '#333'
  }
});
```

### 4.3 Padrões de Estado e Dados

#### Context + Reducer Pattern
```javascript
// context/AuthContext.js
import React, { createContext, useContext, useReducer } from 'react';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return { ...state, user: action.payload, isAuthenticated: true };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    loading: false
  });
  
  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### 4.4 Padrões de Estilização

#### StyleSheet + Tokens
```javascript
// styles/tokens.js
export const tokens = {
  colors: {
    primary: '#3b82f6',
    secondary: '#6b7280',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    background: '#ffffff',
    surface: '#f9fafb'
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32
  },
  typography: {
    h1: { fontSize: 32, fontWeight: 'bold' },
    h2: { fontSize: 24, fontWeight: '600' },
    body: { fontSize: 16, fontWeight: 'normal' }
  }
};

// Uso nos componentes
const styles = StyleSheet.create({
  container: {
    backgroundColor: tokens.colors.background,
    padding: tokens.spacing.md
  },
  title: {
    ...tokens.typography.h1,
    color: tokens.colors.primary
  }
});
```

---

## 🔌 Etapa 5: Estratégia de Integração com Backend Existente

### 5.1 Configuração de API Client

#### Axios Configuration
```javascript
// services/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar token
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('auth_token');
      // Redirecionar para login
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 5.2 Serviços de API

#### Auth Service
```javascript
// services/authService.js
import apiClient from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  async login(email, password) {
    const response = await apiClient.post('/auth/login', {
      email,
      password
    });
    
    const { token, user } = response.data;
    await AsyncStorage.setItem('auth_token', token);
    
    return { token, user };
  },
  
  async logout() {
    await AsyncStorage.removeItem('auth_token');
    await apiClient.post('/auth/logout');
  },
  
  async getProfile() {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  }
};
```

#### Clients Service
```javascript
// services/clientsService.js
import apiClient from './api';

export const clientsService = {
  async getClients(params = {}) {
    const response = await apiClient.get('/clients', { params });
    return response.data;
  },
  
  async getClient(id) {
    const response = await apiClient.get(`/clients/${id}`);
    return response.data;
  },
  
  async createClient(clientData) {
    const response = await apiClient.post('/clients', clientData);
    return response.data;
  },
  
  async updateClient(id, clientData) {
    const response = await apiClient.put(`/clients/${id}`, clientData);
    return response.data;
  },
  
  async deleteClient(id) {
    await apiClient.delete(`/clients/${id}`);
  }
};
```

### 5.3 Custom Hooks para API

#### useApi Hook
```javascript
// hooks/useApi.js
import { useState, useEffect } from 'react';

export const useApi = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiFunction();
        setData(result);
      } catch (err) {
        setError(err.message || 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, dependencies);
  
  const refetch = async () => {
    await fetchData();
  };
  
  return { data, loading, error, refetch };
};

// Uso no componente
const ClientsList = () => {
  const { data: clients, loading, error, refetch } = useApi(
    () => clientsService.getClients()
  );
  
  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={refetch} />;
  
  return <ClientList clients={clients} />;
};
```

### 5.4 Tratamento de Erros e Estados

#### Error Boundary
```javascript
// components/ErrorBoundary.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Algo deu errado</Text>
          <Text style={styles.message}>
            Ocorreu um erro inesperado. Tente novamente.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={styles.buttonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return this.props.children;
  }
}
```

---

## 📅 Etapa 6: Cronograma de Desenvolvimento por Módulos

### 6.1 Cronograma Geral (10 Semanas)

#### **Semana 1: Setup e Fundação**
- **Dias 1-2**: Configuração do projeto Expo
  - Inicialização do projeto
  - Configuração ESLint/Prettier
  - Setup de navegação (React Navigation)
  - Configuração de variáveis de ambiente

- **Dias 3-4**: Design System Base
  - Implementação de tokens de design
  - Componentes UI básicos (Button, Input, Card)
  - Configuração de temas (light/dark)

- **Dias 5**: Integração API
  - Configuração Axios
  - Serviços de autenticação
  - Interceptors e tratamento de erro

#### **Semana 2: Autenticação e Navegação**
- **Dias 1-2**: Sistema de Autenticação
  - Telas de Login/Register
  - Context de autenticação
  - Persistência de token

- **Dias 3-4**: Navegação Principal
  - Stack Navigator
  - Tab Navigator
  - Drawer Navigator (se necessário)
  - Proteção de rotas

- **Dia 5**: Testes e Refinamentos
  - Testes de autenticação
  - Ajustes de UX

#### **Semana 3: Dashboard e KPIs**
- **Dias 1-2**: Estrutura do Dashboard
  - Layout principal
  - Componentes de KPI
  - Integração com API de dashboard

- **Dias 3-4**: Gráficos e Visualizações
  - Implementação de charts (react-native-chart-kit)
  - Gráficos de linha, pizza e barras
  - Filtros de período

- **Dia 5**: Otimização e Performance
  - Lazy loading
  - Cache de dados
  - Testes de performance

#### **Semana 4: Gestão de Clientes**
- **Dias 1-2**: Listagem de Clientes
  - FlatList otimizada
  - Busca e filtros
  - Paginação

- **Dias 3-4**: CRUD de Clientes
  - Formulário de cadastro
  - Edição de clientes
  - Validações

- **Dia 5**: Detalhes e Histórico
  - Tela de detalhes
  - Histórico de contratos
  - Upload de documentos

#### **Semana 5: Gestão de Contratos**
- **Dias 1-2**: Listagem de Contratos
  - Lista com filtros
  - Status e indicadores
  - Busca avançada

- **Dias 3-4**: Criação de Contratos
  - Formulário completo
  - Cálculo automático de parcelas
  - Validações financeiras

- **Dia 5**: Cronograma de Pagamentos
  - Geração automática
  - Visualização de parcelas
  - Edição de cronograma

#### **Semana 6: Gestão de Pagamentos**
- **Dias 1-2**: Listagem de Pagamentos
  - Cronograma visual
  - Status de parcelas
  - Filtros por status

- **Dias 3-4**: Registro de Pagamentos
  - Formulário de pagamento
  - Múltiplos métodos
  - Cálculo de juros/multa

- **Dia 5**: Relatórios de Cobrança
  - Parcelas em atraso
  - Relatórios de inadimplência
  - Exportação de dados

#### **Semana 7: Importação CSV**
- **Dias 1-2**: Interface de Upload
  - Componente de upload
  - Validação de arquivo
  - Preview de dados

- **Dias 3-4**: Pipeline de Importação
  - Mapeamento de colunas
  - Validação de dados
  - Processamento em lote

- **Dia 5**: Relatórios de Importação
  - Log de erros
  - Relatório de sucesso
  - Rollback de importação

#### **Semana 8: Relatórios e Exportação**
- **Dias 1-2**: Relatórios Financeiros
  - Relatórios de receita
  - Análise de inadimplência
  - Comparativos por período

- **Dias 3-4**: Exportação de Dados
  - Exportação CSV
  - Geração de PDF
  - Compartilhamento de relatórios

- **Dia 5**: Dashboards Avançados
  - Análise de cohort
  - Projeções financeiras
  - Métricas avançadas

#### **Semana 9: Funcionalidades Mobile**
- **Dias 1-2**: Camera e Upload
  - Integração com câmera
  - Upload de documentos
  - Compressão de imagens

- **Dias 3-4**: Offline Support
  - Cache local
  - Sincronização offline
  - Queue de operações

- **Dia 5**: Push Notifications
  - Configuração de notificações
  - Lembretes de pagamento
  - Alertas de sistema

#### **Semana 10: Testes e Otimização**
- **Dias 1-2**: Testes Automatizados
  - Testes unitários (Jest)
  - Testes de integração
  - Testes E2E (Detox)

- **Dias 3-4**: Performance e Otimização
  - Análise de bundle
  - Otimização de imagens
  - Lazy loading avançado

- **Dia 5**: Deploy e Documentação
  - Build de produção
  - Deploy nas stores
  - Documentação final

### 6.2 Marcos e Entregas

#### Marco 1 (Semana 2): MVP Autenticação
- ✅ Login/Logout funcional
- ✅ Navegação básica
- ✅ Integração com backend

#### Marco 2 (Semana 4): Dashboard Operacional
- ✅ Dashboard com KPIs
- ✅ Gestão básica de clientes
- ✅ Visualizações gráficas

#### Marco 3 (Semana 6): Core Business
- ✅ Gestão completa de contratos
- ✅ Sistema de pagamentos
- ✅ Cronogramas automáticos

#### Marco 4 (Semana 8): Funcionalidades Avançadas
- ✅ Importação CSV
- ✅ Relatórios completos
- ✅ Exportação de dados

#### Marco 5 (Semana 10): Produto Final
- ✅ Funcionalidades mobile
- ✅ Testes completos
- ✅ Deploy em produção

### 6.3 Dependências e Riscos

#### Dependências Críticas
1. **Backend Estável**: API deve estar funcional e documentada
2. **Supabase Configurado**: Auth e storage operacionais
3. **Design System**: Tokens e componentes definidos
4. **Dados de Teste**: Base de dados para desenvolvimento

#### Riscos Identificados
1. **Performance em Listas Grandes**: Mitigação com virtualização
2. **Compatibilidade de Dados**: Validação contínua com backend
3. **Complexidade de Gráficos**: Uso de bibliotecas testadas
4. **Upload de Arquivos**: Implementação robusta de storage

---

## 🧪 Etapa 7: Plano de Testes e Validação

### 7.1 Estratégia de Testes

#### Pirâmide de Testes
```
        E2E Tests (10%)
       ├─ Fluxos críticos
       └─ Jornadas do usuário
    
    Integration Tests (20%)
   ├─ API integration
   ├─ Navigation flows
   └─ State management
   
  Unit Tests (70%)
 ├─ Components
 ├─ Hooks
 ├─ Utils
 └─ Services
```

### 7.2 Testes Unitários

#### Configuração Jest
```javascript
// jest.config.js
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  testMatch: [
    '**/__tests__/**/*.(js|jsx|ts|tsx)',
    '**/*.(test|spec).(js|jsx|ts|tsx)'
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
    '!src/index.js'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

#### Exemplos de Testes
```javascript
// components/ui/Button/Button.test.js
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders correctly with title', () => {
    const { getByText } = render(<Button title="Test Button" />);
    expect(getByText('Test Button')).toBeTruthy();
  });
  
  it('calls onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button title="Test" onPress={mockOnPress} />
    );
    
    fireEvent.press(getByText('Test'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
  
  it('shows loading state', () => {
    const { getByText } = render(
      <Button title="Test" loading={true} />
    );
    
    expect(getByText('Carregando...')).toBeTruthy();
  });
});

// hooks/useAuth.test.js
import { renderHook, act } from '@testing-library/react-hooks';
import { useAuth } from './useAuth';
import { AuthProvider } from '../context/AuthContext';

describe('useAuth Hook', () => {
  it('should login successfully', async () => {
    const wrapper = ({ children }) => (
      <AuthProvider>{children}</AuthProvider>
    );
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await act(async () => {
      await result.current.login('test@test.com', 'password');
    });
    
    expect(result.current.isAuthenticated).toBe(true);
  });
});
```

### 7.3 Testes de Integração

#### API Integration Tests
```javascript
// services/clientsService.test.js
import { clientsService } from './clientsService';
import MockAdapter from 'axios-mock-adapter';
import apiClient from './api';

describe('Clients Service', () => {
  let mock;
  
  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });
  
  afterEach(() => {
    mock.restore();
  });
  
  it('should fetch clients successfully', async () => {
    const mockClients = [
      { id: '1', name: 'Cliente 1' },
      { id: '2', name: 'Cliente 2' }
    ];
    
    mock.onGet('/clients').reply(200, mockClients);
    
    const result = await clientsService.getClients();
    expect(result).toEqual(mockClients);
  });
  
  it('should handle API errors', async () => {
    mock.onGet('/clients').reply(500);
    
    await expect(clientsService.getClients()).rejects.toThrow();
  });
});
```

### 7.4 Testes End-to-End

#### Detox Configuration
```javascript
// .detoxrc.json
{
  "testRunner": "jest",
  "runnerConfig": "e2e/config.json",
  "configurations": {
    "ios.sim.debug": {
      "binaryPath": "ios/build/Build/Products/Debug-iphonesimulator/FinanceApp.app",
      "build": "xcodebuild -workspace ios/FinanceApp.xcworkspace -scheme FinanceApp -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build",
      "type": "ios.simulator",
      "device": {
        "type": "iPhone 12"
      }
    }
  }
}

// e2e/login.e2e.js
describe('Login Flow', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });
  
  it('should login successfully', async () => {
    await element(by.id('email-input')).typeText('test@test.com');
    await element(by.id('password-input')).typeText('password');
    await element(by.id('login-button')).tap();
    
    await expect(element(by.id('dashboard-screen'))).toBeVisible();
  });
  
  it('should show error for invalid credentials', async () => {
    await element(by.id('email-input')).typeText('invalid@test.com');
    await element(by.id('password-input')).typeText('wrong');
    await element(by.id('login-button')).tap();
    
    await expect(element(by.text('Credenciais inválidas'))).toBeVisible();
  });
});
```

### 7.5 Testes de Performance

#### Performance Monitoring
```javascript
// utils/performance.js
export const measurePerformance = (name, fn) => {
  return async (...args) => {
    const start = performance.now();
    const result = await fn(...args);
    const end = performance.now();
    
    console.log(`${name} took ${end - start} milliseconds`);
    
    // Log para analytics se necessário
    if (end - start > 1000) {
      console.warn(`Slow operation detected: ${name}`);
    }
    
    return result;
  };
};

// Uso nos componentes
const ClientsList = () => {
  const loadClients = measurePerformance(
    'Load Clients',
    clientsService.getClients
  );
  
  // resto do componente
};
```

### 7.6 Validação de Acessibilidade

#### Accessibility Tests
```javascript
// components/ui/Button/Button.a11y.test.js
import { render } from '@testing-library/react-native';
import { Button } from './Button';

describe('Button Accessibility', () => {
  it('should have proper accessibility props', () => {
    const { getByRole } = render(
      <Button 
        title="Submit" 
        accessibilityLabel="Submit form"
        accessibilityHint="Submits the current form"
      />
    );
    
    const button = getByRole('button');
    expect(button).toHaveAccessibilityState({ disabled: false });
  });
});
```

### 7.7 Cronograma de Testes

#### Testes Contínuos (Durante Desenvolvimento)
- **Testes Unitários**: A cada commit
- **Testes de Integração**: A cada PR
- **Linting/Formatting**: Pre-commit hooks

#### Testes de Milestone
- **Semana 2**: Testes de autenticação
- **Semana 4**: Testes de dashboard e clientes
- **Semana 6**: Testes de contratos e pagamentos
- **Semana 8**: Testes de importação e relatórios
- **Semana 10**: Testes E2E completos

#### Critérios de Aceitação
- **Cobertura de Código**: Mínimo 80%
- **Testes E2E**: Todos os fluxos críticos
- **Performance**: Carregamento < 3s
- **Acessibilidade**: Conformidade WCAG 2.1 AA

---

## 📚 Etapa 8: Documentação Técnica Atualizada

### 8.1 Documentação de Arquitetura

#### README Principal
```markdown
# 📱 Finance App - React Native

Sistema de Gestão Financeira desenvolvido em React Native com Expo.

## 🚀 Quick Start

### Pré-requisitos
- Node.js 18+
- Expo CLI
- iOS Simulator / Android Emulator

### Instalação
```bash
# Clone o repositório
git clone [repo-url]
cd finance-app

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env

# Inicie o projeto
expo start
```

### Estrutura do Projeto
```
src/
├── components/     # Componentes reutilizáveis
├── screens/        # Telas da aplicação
├── navigation/     # Configuração de navegação
├── services/       # Serviços de API
├── hooks/          # Custom hooks
├── context/        # Context providers
├── utils/          # Funções utilitárias
└── constants/      # Constantes da aplicação
```

## 🏗️ Arquitetura

### Padrões Utilizados
- **State Management**: Context API + useReducer
- **Navigation**: React Navigation 6
- **API Client**: Axios com interceptors
- **Styling**: StyleSheet + Design Tokens
- **Testing**: Jest + React Native Testing Library

### Fluxo de Dados
```
User Action → Component → Hook → Service → API → Backend
```
```

#### Documentação de Componentes
```markdown
# 🎨 Design System

## Componentes Base

### Button
Componente de botão reutilizável com múltiplas variantes.

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| title | string | - | Texto do botão |
| variant | 'primary' \| 'secondary' \| 'outline' | 'primary' | Variante visual |
| size | 'small' \| 'medium' \| 'large' | 'medium' | Tamanho do botão |
| onPress | function | - | Callback ao pressionar |
| disabled | boolean | false | Estado desabilitado |
| loading | boolean | false | Estado de carregamento |

#### Exemplo de Uso
```jsx
import { Button } from '../components/ui/Button';

<Button
  title="Salvar"
  variant="primary"
  onPress={handleSave}
  loading={isLoading}
/>
```

### Input
Componente de entrada de texto com validação.

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| label | string | - | Label do campo |
| placeholder | string | - | Placeholder |
| value | string | - | Valor atual |
| onChangeText | function | - | Callback de mudança |
| error | string | - | Mensagem de erro |
| required | boolean | false | Campo obrigatório |

#### Exemplo de Uso
```jsx
import { Input } from '../components/ui/Input';

<Input
  label="Email"
  placeholder="Digite seu email"
  value={email}
  onChangeText={setEmail}
  error={emailError}
  required
/>
```
```

### 8.2 Documentação de API

#### Endpoints Disponíveis
```markdown
# 🔌 API Documentation

## Base URL
```
http://localhost:3000/api
```

## Autenticação
Todas as rotas protegidas requerem header de autorização:
```
Authorization: Bearer <token>
```

## Endpoints

### Auth
- `POST /auth/login` - Login do usuário
- `POST /auth/register` - Registro de usuário
- `GET /auth/profile` - Perfil do usuário logado
- `POST /auth/logout` - Logout

### Clients
- `GET /clients` - Lista clientes (com paginação)
- `GET /clients/:id` - Detalhes do cliente
- `POST /clients` - Criar cliente
- `PUT /clients/:id` - Atualizar cliente
- `DELETE /clients/:id` - Deletar cliente

### Contracts
- `GET /contracts` - Lista contratos
- `GET /contracts/:id` - Detalhes do contrato
- `POST /contracts` - Criar contrato
- `PUT /contracts/:id` - Atualizar contrato
- `DELETE /contracts/:id` - Deletar contrato

### Payments
- `GET /payments` - Lista pagamentos
- `GET /payments/:id` - Detalhes do pagamento
- `POST /payments` - Registrar pagamento
- `PUT /payments/:id` - Atualizar pagamento

### Dashboard
- `GET /dashboard/kpis` - KPIs principais
- `GET /dashboard/charts` - Dados para gráficos
- `GET /dashboard/reports` - Relatórios
```

### 8.3 Guias de Desenvolvimento

#### Guia de Contribuição
```markdown
# 🤝 Guia de Contribuição

## Fluxo de Desenvolvimento

### 1. Criação de Branch
```bash
# Para nova feature
git checkout -b feature/nome-da-feature

# Para correção
git checkout -b fix/nome-do-fix
```

### 2. Desenvolvimento
- Siga os padrões de código estabelecidos
- Escreva testes para novas funcionalidades
- Mantenha commits pequenos e descritivos

### 3. Testes
```bash
# Execute todos os testes
npm test

# Testes com coverage
npm run test:coverage

# Testes E2E
npm run test:e2e
```

### 4. Pull Request
- Título descritivo
- Descrição detalhada das mudanças
- Screenshots para mudanças visuais
- Checklist de validação

## Padrões de Commit
```
feat: adiciona nova funcionalidade
fix: corrige bug
docs: atualiza documentação
style: mudanças de formatação
refactor: refatoração de código
test: adiciona ou corrige testes
chore: tarefas de manutenção
```

## Code Review
- Pelo menos 1 aprovação necessária
- Todos os testes devem passar
- Coverage mínimo de 80%
- Sem conflitos de merge
```

#### Guia de Deploy
```markdown
# 🚀 Guia de Deploy

## Ambientes

### Development
- **URL**: http://localhost:19006
- **Backend**: http://localhost:3000
- **Deploy**: Automático via Expo Dev

### Staging
- **URL**: https://staging.financeapp.com
- **Backend**: https://api-staging.financeapp.com
- **Deploy**: Manual via Expo Build

### Production
- **URL**: https://app.financeapp.com
- **Backend**: https://api.financeapp.com
- **Deploy**: Automático via CI/CD

## Processo de Deploy

### 1. Build
```bash
# Build para iOS
expo build:ios

# Build para Android
expo build:android
```

### 2. Testes
```bash
# Testes completos
npm run test:all

# Validação de build
npm run validate:build
```

### 3. Deploy
```bash
# Deploy para staging
npm run deploy:staging

# Deploy para production
npm run deploy:production
```

## Checklist de Deploy
- [ ] Todos os testes passando
- [ ] Build sem erros
- [ ] Variáveis de ambiente configuradas
- [ ] Backup do banco realizado
- [ ] Monitoramento ativo
- [ ] Rollback plan definido
```

### 8.4 Documentação de Troubleshooting

#### Problemas Comuns
```markdown
# 🔧 Troubleshooting

## Problemas Comuns

### 1. Erro de Conexão com API
**Sintoma**: Requests falhando com timeout
**Causa**: Backend não está rodando ou URL incorreta
**Solução**:
```bash
# Verificar se backend está rodando
curl http://localhost:3000/api/health

# Verificar variáveis de ambiente
cat .env
```

### 2. Erro de Autenticação
**Sintoma**: 401 Unauthorized em requests
**Causa**: Token expirado ou inválido
**Solução**:
```javascript
// Limpar token e fazer login novamente
await AsyncStorage.removeItem('auth_token');
```

### 3. Performance Lenta
**Sintoma**: App lento, especialmente em listas
**Causa**: Renderização excessiva ou dados não otimizados
**Solução**:
- Implementar FlatList com getItemLayout
- Usar React.memo em componentes
- Implementar lazy loading

### 4. Crash no iOS
**Sintoma**: App fecha inesperadamente no iOS
**Causa**: Geralmente relacionado a memória ou threading
**Solução**:
- Verificar logs no Xcode
- Implementar error boundaries
- Otimizar uso de memória

## Logs e Debugging

### Flipper Integration
```bash
# Instalar Flipper
npm install --save-dev react-native-flipper

# Configurar no código
import { logger } from 'react-native-flipper';
logger.log('Debug message');
```

### Remote Debugging
```bash
# Habilitar remote debugging
# Shake device → Debug → Debug Remote JS
```

### Performance Monitoring
```javascript
// Usar Performance API
const start = performance.now();
// ... código a ser medido
const end = performance.now();
console.log(`Operação levou ${end - start}ms`);
```
```

### 8.5 Documentação de Manutenção

#### Atualizações e Dependências
```markdown
# 🔄 Manutenção

## Atualizações Regulares

### Dependências
```bash
# Verificar dependências desatualizadas
npm outdated

# Atualizar dependências menores
npm update

# Atualizar dependências maiores (cuidado!)
npm install package@latest
```

### Expo SDK
```bash
# Verificar versão atual
expo --version

# Atualizar Expo CLI
npm install -g @expo/cli@latest

# Upgrade do projeto
expo upgrade
```

### React Native
```bash
# Verificar versão
npx react-native --version

# Upgrade (seguir guia oficial)
npx react-native upgrade
```

## Monitoramento

### Métricas Importantes
- Crash rate < 1%
- ANR rate < 0.5%
- Startup time < 3s
- Memory usage < 200MB
- Bundle size < 50MB

### Ferramentas
- **Crashlytics**: Crash reporting
- **Analytics**: Usage tracking  
- **Performance**: App performance
- **Sentry**: Error tracking

## Backup e Recovery

### Dados Críticos
- Configurações de ambiente
- Certificados de build
- Chaves de API
- Dados de usuário (via backend)

### Procedimento de Backup
1. Export de configurações
2. Backup de certificados
3. Snapshot do banco de dados
4. Versionamento de código
```

<function_calls>
<invoke name="todo_write">
<parameter name="explanation">Completando a criação do plano aprimorado e iniciando a validação final