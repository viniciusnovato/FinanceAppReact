# 🎨 Prompt para o TRAE – Tornar o ERP mais Profissional (Estilo ERP de Gestão)

Quero que você **refatore o design do ERP de pagamentos** para que tenha um aspecto **mais profissional e corporativo**, semelhante a um **ERP de gestão administrativa**, e não apenas um aplicativo mobile.

---

## 🎯 Diretrizes de Design
- Layout deve se aproximar de **sistemas ERP tradicionais** (mais "desktop-like" mesmo em mobile).
- Paleta de cores: **tons neutros e profissionais** (cinza, azul escuro, branco, com poucos destaques em cores fortes).
- Tipografia: clara e objetiva, **sem exageros visuais**.
- Evitar botões muito grandes ou com estilo “mobile first”.  
- Usar **cards discretos**, tabelas responsivas e menus laterais (sidebars).
- Foco em **usabilidade para gestão** e não apenas estética.

---

## 🖥️ Estrutura Visual
1. **Dashboard principal**
   - Exibir gráficos e métricas (clientes ativos, contratos em andamento, pagamentos atrasados, total recebido no mês).
   - Layout em cards profissionais (sem parecer "aplicativo colorido").

2. **Menu lateral fixo (sidebar)**
   - Ícones e nomes para: Clientes, Contratos, Pagamentos, Dashboard.
   - Padrão de ERP: menu sempre disponível, não um menu "hambúrguer".

3. **Tabelas de dados**
   - Clientes, contratos e pagamentos devem ser listados em formato **tabela (grid)**.
   - Campos bem organizados, com **filtros avançados e ordenação**.
   - Paginação ou scroll infinito, mas mantendo aspecto de sistema de gestão.

4. **Formulários**
   - Layout limpo, organizado em colunas.
   - Campos agrupados por seções (ex.: Dados Pessoais, Endereço, Contrato, Pagamento).
   - Evitar inputs muito grandes e arredondados.

5. **Filtros e badges**
   - Mostrar **filtros como chips/badges discretos**.
   - Permitir **limpar todos os filtros** de forma clara.

---

## 🛠️ Tecnologias de UI recomendadas
- **React Native Paper** (componentes mais sóbrios, estilo empresarial).
- **React Native Data Table** ou equivalente para tabelas.
- **Victory Native** ou **Recharts** para gráficos de estatísticas.
- Layout inspirado em **ERP Web adaptado ao mobile** (não estilo app social).

---

## ✨ Objetivo
O sistema deve parecer uma **ferramenta de gestão empresarial**, com foco em:
- **Eficiência e clareza**  
- **Interface organizada**  
- **Aspecto corporativo e confiável**

Nada de estilo “app mobile moderno” com botões enormes e cores vibrantes.  
Deve ser um **ERP sério, profissional, corporativo e robusto**.