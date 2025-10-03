# 🔎 Prompt para o TRAE – Filtros Avançados na Tela de Pagamentos

Quero que você implemente um **filtro completo na tela de pagamentos** do ERP, permitindo que o usuário pesquise e refine os registros de acordo com múltiplos critérios disponíveis no banco.

---

## 📌 Campos de Filtro

### 📅 Datas
- **Due Date (data de vencimento)**
  - Filtro por intervalo (`due_date >= X AND due_date <= Y`)
- **Paid Date (data de pagamento)**
  - Filtro por intervalo (`paid_date >= X AND paid_date <= Y`)
- **Created At (data de criação do registro)**
  - Filtro por intervalo (`created_at >= X AND created_at <= Y`)

### 💰 Valores
- **Amount (valor da parcela)**  
  - Filtro por intervalo (`amount BETWEEN X AND Y`)

### 📄 Status
- **Status do pagamento**
  - Opções comuns: `"pending"`, `"paid"`, `"overdue"`, etc.

### 💳 Método de Pagamento
- **Payment Method**
  - Opções: cartão, transferência, dinheiro, etc. (baseado nos dados do banco).

### 🔖 Tipo de Pagamento
- **Payment Type**
  - Valores do ENUM: `"normalPayment"` ou `"downPayment"`.

### 📑 Contratos
- **Contract Number**
  - Buscar pelo número do contrato (`contracts.contract_number`).
- **Status do contrato**
  - `"active"`, `"closed"`, `"canceled"`, etc.

### 👤 Clientes
- **Nome do cliente**
  - `clients.first_name` + `clients.last_name`
- **E-mail do cliente**
- **Telefone do cliente**
- **Tax ID (NIF/CPF/CNPJ)**

---

## 🎨 Layout do Filtro
- Colocar um botão “Filtrar” acima da tabela de pagamentos.
- Abrir um painel (ou dropdown expansível) com os filtros disponíveis.
- Cada filtro deve ser **combinável** (ex.: status + intervalo de datas + cliente).
- Mostrar **chips/badges** com os filtros aplicados, com opção de removê-los individualmente.
- Adicionar botão **“Limpar filtros”** para resetar todos os campos.

---

## 🛠️ Backend
- Criar endpoint `GET /payments` que aceite query params:
  - `status`, `payment_method`, `payment_type`
  - `due_date_from`, `due_date_to`
  - `paid_date_from`, `paid_date_to`
  - `amount_min`, `amount_max`
  - `contract_number`, `contract_status`
  - `client_name`, `client_email`, `client_phone`, `tax_id`
- Endpoint deve realizar **JOIN com contracts e clients** para permitir filtragem cruzada.

Exemplo de query simplificada:
```sql
SELECT p.*, c.contract_number, cl.first_name, cl.last_name
FROM payments p
JOIN contracts c ON p.contract_id = c.id
JOIN clients cl ON c.client_id = cl.id
WHERE (p.status = 'pending')
  AND (p.due_date BETWEEN '2025-01-01' AND '2025-12-31')
  AND (cl.tax_id = '123456789');

```

🧪 Testes
	•	Filtrar por data de vencimento (range).
	•	Filtrar por status + cliente.
	•	Filtrar por contrato + intervalo de valores.
	•	Usar múltiplos filtros em conjunto.
	•	Garantir que “Limpar filtros” reseta corretamente a listagem.


🎯 Objetivo: Criar um filtro avançado e flexível na tela de pagamentos, permitindo que o usuário refine resultados por cliente, contrato, status, datas, valores e método de pagamento, com integração total entre frontend e backend.