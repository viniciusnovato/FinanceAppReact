# ⚙️ Prompt para o TRAE – Criação Automática e Exclusão de Pagamentos ao Registrar Contrato

Quero que você adicione novas funcionalidades no ERP de gestão de pagamentos:

---

## 📌 Funcionalidade 1 – Criação Automática de Pagamentos
- Sempre que um **novo contrato** for criado:
  1. Calcular o valor a ser parcelado:
     - `valor_a_parcelar = value - down_payment`
  2. Dividir esse valor pelo número de parcelas:
     - `valor_parcela = valor_a_parcelar / number_of_payments`
  3. Criar automaticamente **N registros de pagamentos** (onde `N = number_of_payments`).
  4. Cada pagamento deve ser inserido na tabela **payments** respeitando a estrutura já existente.

---

## 📌 Funcionalidade 2 – Exclusão em Massa de Pagamentos
- Deve existir uma **função no backend** que permita apagar **todas as parcelas de um contrato de uma só vez**.
- Regras:
  1. Receber como parâmetro o `contract_id`.
  2. Executar um `DELETE` em todos os registros da tabela `payments` vinculados a esse contrato.
  3. O processo deve ser transacional:
     - Se falhar a exclusão, nenhuma linha deve ser removida.
  4. Deve haver um **endpoint dedicado**:  
     - `DELETE /contracts/:id/payments`
  5. Apenas usuários autenticados e com permissão podem executar essa ação.

---

## 🗄️ Estrutura das Tabelas (resumo)

### `contracts`
- Campos principais:  
  - `id`, `client_id`, `value`, `start_date`, `down_payment`, `number_of_payments`.

### `payments`
- Campos principais:  
  - `id`, `contract_id`, `amount`, `due_date`, `status`, `payment_type`.

---

## 📐 Regras de Negócio
1. A **primeira parcela** deve sempre começar em `start_date` do contrato.
2. Os pagamentos são **mensais** por padrão:
   - Parcela 1 → `start_date`
   - Parcela 2 → `start_date + 1 mês`
   - ...
3. O campo **status** deve iniciar como `"pending"`.
4. O campo **payment_type** deve ser:
   - `"normalPayment"` para parcelas
   - `"downPayment"` para o valor de entrada
5. Caso exista **down_payment**, registrar também um pagamento inicial separado:
   - `amount = down_payment`
   - `due_date = start_date`
   - `status = "paid"`
   - `payment_type = "downPayment"`

---

## 🛠️ Implementação
- Adicionar lógica no **ContractService**:
  - Ao criar contrato → gerar pagamentos automaticamente.
  - Ao excluir pagamentos do contrato → remover todas as parcelas vinculadas.
- Endpoints REST:
  - `POST /contracts` → cria contrato e gera pagamentos
  - `DELETE /contracts/:id/payments` → remove todas as parcelas do contrato
- Transacional:
  - Se falhar a criação ou exclusão, nada deve ser persistido.

---

## 🧪 Testes
- Criação de contrato com e sem entrada (`down_payment`).
- Parcelamentos variados (`number_of_payments` = 1, 6, 12).
- Exclusão em massa → verificar que **todos os pagamentos do contrato foram removidos**.
- Garantir que contratos sem pagamentos não quebrem o processo.
- Testar segurança → apenas usuários autenticados podem excluir.

---

🎯 **Objetivo:** Garantir que todo contrato criado já tenha automaticamente seus pagamentos gerados e permitir a exclusão em massa das parcelas de um contrato, mantendo integridade e consistência no banco de dados.