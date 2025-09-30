# Prompt para o TRAE - Implementação de CRUD no Frontend (React Native ERP)

## Contexto
O ERP financeiro em **React Native** já possui navegação estruturada e um **dashboard inicial**.  
As telas de **Clients, Contracts e Payments** já listam dados corretamente, mas ainda não possuem o CRUD completo implementado.

## Objetivo
Implementar **CRUD (Create, Read, Update, Delete)** no **frontend** para as entidades:
- **Clients**
- **Contracts**
- **Payments**

### Relações entre entidades
- **Um Cliente (Client)** pode ter vários **Contratos (Contracts)**.  
- **Um Contrato (Contract)** pertence a apenas **um Cliente (Client)**.  
- **Um Contrato (Contract)** pode ter vários **Pagamentos (Payments)**.  
- **Um Pagamento (Payment)** pertence a apenas **um Contrato (Contract)**.

### Regras de Negócio
1. **Clients**
   - Permitir criar, editar e excluir clientes.
   - Ao excluir um cliente, todos os contratos vinculados a ele também devem ser excluídos (com confirmação do usuário).

2. **Contracts**
   - Permitir criar, editar e excluir contratos.
   - Cada contrato deve estar vinculado a um cliente existente (seleção via dropdown ou busca).
   - Ao excluir um contrato, todos os pagamentos associados a ele devem ser removidos (com confirmação do usuário).

3. **Payments**
   - Permitir criar, editar e excluir pagamentos.
   - Cada pagamento deve estar vinculado a um contrato existente.
   - Implementar **paginação** na listagem de pagamentos, para não carregar todos de uma vez.  
     - Exemplo: carregar 20 pagamentos por vez, com botão ou scroll infinito para carregar mais.

### Funcionalidades técnicas
- Criar formulários para **Create/Update** usando inputs controlados.
- Usar modais ou telas dedicadas para as operações.
- Incluir **validação de campos obrigatórios** (ex.: nome do cliente, valor do pagamento, datas).
- Adicionar **confirmações** antes de operações destrutivas (delete).
- Garantir consistência visual com o restante do ERP.
- Respeitar o modelo de dados do banco já existente.

## Resultado Esperado
- O usuário pode gerenciar **Clients, Contracts e Payments** de forma completa no frontend.
- A listagem de **Payments** utiliza paginação, evitando sobrecarga.
- A relação entre entidades é respeitada, garantindo integridade na criação e exclusão.