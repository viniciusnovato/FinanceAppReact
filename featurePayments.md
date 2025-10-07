# 💳 Funcionalidade de Gestão de Pagamentos e Saldo de Contrato

## 1. Marcar parcela como paga (checkbox)

- Ao clicar no **checkbox “Pago”** de uma parcela:
  - O campo `status` da parcela deve mudar automaticamente para **`"paid"`**.
  - O campo `paid_amount` deve receber automaticamente o mesmo valor de `amount`.
  - Caso o valor pago seja igual ao valor da parcela, nenhuma nova ação é necessária.

---

## 2. Pagamento parcial (valor pago **menor** que o da parcela)

- Se `paid_amount < amount`:
  - Deve ser criada automaticamente uma **nova parcela** após a última parcela existente do contrato.
  - Essa nova parcela representará o **saldo devedor** e deve conter:
    - `amount = amount - paid_amount`
    - `status = 'pending'`
    - `due_date = mês seguinte à última parcela`
    - `payment_type = 'normalPayment'`
    - `payment_method` igual à da parcela original
    - `notes = 'Parcela criada automaticamente por saldo devedor'`

---

## 3. Pagamento excedente (valor pago **maior** que o da parcela)

- Se `paid_amount > amount`:
  - O valor excedente (`paid_amount - amount`) **não deve ser deduzido da próxima parcela**,  
    mas sim **adicionado ao campo `positive_balance` do contrato**.
  - Esse valor representa um **crédito do paciente** (pagamento a mais que poderá ser usado futuramente).
  - O campo `positive_balance` deve acumular esse excedente, somando ao valor já existente.
  - Esse saldo deve ser exibido **no modal de resumo do contrato** (ao clicar no ícone de olho na tabela de contratos).

---

## 4. Inserção manual de valor pago

- Ao clicar no **ícone amarelo de dinheiro** na coluna de ações:
  - Um **modal** deve ser exibido com um campo numérico para o usuário inserir o valor pago.
  - Após confirmar:
    - O sistema deve aplicar automaticamente as regras dos itens 2 e 3.
    - Atualizar `paid_amount`, `status`, e — se houver excedente — atualizar também o campo `positive_balance` no contrato.
    - Exibir uma notificação de sucesso (“Pagamento atualizado com sucesso”).

---

## 5. Resumo do contrato (modal do olho 👁️)

- No modal de visualização do contrato (ao clicar no ícone de olho):
  - Exibir no topo ou rodapé um campo chamado **“Saldo positivo do contrato”**, mostrando o valor de `positive_balance`.
  - O valor deve ser formatado em euros (ex: `€120,00`) e atualizado em tempo real sempre que houver alteração nos pagamentos.

---

## 6. Observações gerais

- Todas as alterações devem refletir imediatamente no banco de dados:
  - `payments.status`
  - `payments.paid_amount`
  - `contracts.positive_balance`
- As parcelas criadas automaticamente devem manter consistência de datas, métodos e relacionamento (`contract_id`).
- O campo `positive_balance` deve ser recalculado sempre que houver novos pagamentos manuais ou automáticos.