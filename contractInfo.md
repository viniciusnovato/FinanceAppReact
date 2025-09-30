# 🖼️ Prompt para o TRAE – Modal de Visualização de Contrato

Quero que você crie uma **nova funcionalidade** no ERP: um **modal de visualização de contrato**, acessível a partir da listagem de contratos.

---

## 📌 Requisitos do Modal
1. O modal deve abrir ao clicar em um contrato da listagem.
2. O modal deve exibir:
   - **Número do contrato** (`contract_number`)
   - **Cliente associado** (`client_id` → nome do cliente)
   - **Descrição** (`description`)
   - **Valor total do contrato** (`value`)
   - **Data de início** (`start_date`)
   - **Data de término** (`end_date`)
   - **Número de parcelas** (`number_of_payments`)
   - **Valor de entrada** (`down_payment`)
   - **Status do contrato** (`status`)
   - **Frequência de pagamento** (`payment_frequency`)
3. Exibir também uma **barra de progresso** ou percentual com:
   - **Porcentagem paga do contrato** =  
     ```
     (down_payment + soma de todos os pagamentos com status = 'paid') / value * 100
     ```
   - Observação: além das parcelas normais, podem existir pagamentos complementares (`comp I`, `comp II` etc.), e **todos eles devem ser somados** se tiverem `status = 'paid'`.

---

## 📊 Exemplo de Cálculo
- Contrato: €10.000  
- Entrada: €2.000  
- Pagamentos: 8 parcelas de €1.000  
- Pagamentos complementares: comp I = €500 (paid), comp II = €500 (paid)  
- Já foram pagos 2 parcelas (€2.000) + entrada (€2.000) + complementares (€1.000)  
- Percentual pago = (5.000 / 10.000) = **50%**

---

## 🎨 Layout do Modal
- Título: "Detalhes do Contrato"
- Seções organizadas em **cards**:
  1. **Informações do contrato** (dados gerais)
  2. **Progresso de pagamento** (percentual + barra)
  3. **Lista de parcelas e complementares** (tabela com due_date, amount, status, payment_type)

---

## 🛠️ Backend
- Criar endpoint:
  - `GET /contracts/:id/details`
  - Deve retornar:
    - Dados completos do contrato
    - Soma de pagamentos pagos (incluindo complementares)
    - Percentual pago calculado
    - Lista de pagamentos detalhada

---

## 🧪 Testes
- Contrato com apenas entrada (sem parcelas pagas).
- Contrato com parcelas pagas parcialmente.
- Contrato com **pagamentos complementares pagos** (comp I, comp II).
- Contrato 100% pago (percentual = 100%).

---

🎯 **Objetivo:** Criar um **modal de visualização de contratos** que mostre informações detalhadas e a **porcentagem paga do contrato**, somando entrada e todos os pagamentos (inclusive complementares) com status `"paid"`.