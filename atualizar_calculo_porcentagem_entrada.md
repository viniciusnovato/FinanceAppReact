# 🧮 Atualizar Cálculo da Porcentagem da Entrada

## 🎯 Objetivo
Alterar o cálculo de **porcentagem da entrada** dos contratos para refletir **a soma de todos os pagamentos efetuados** (tanto `downPayment` quanto `normalPayment`) associados ao contrato.

---

## 🧩 Contexto Técnico

Atualmente, o sistema utiliza o campo `contracts.down_payment` como base para o cálculo da entrada.  
Esse comportamento deve ser alterado para que o cálculo seja dinâmico e baseado **na soma real dos pagamentos já efetuados** no contrato.

### Estrutura das tabelas envolvidas:

```sql
public.contracts (
  id uuid PRIMARY KEY,
  value numeric,
  down_payment numeric,
  ...
);

public.payments (
  id uuid PRIMARY KEY,
  contract_id uuid REFERENCES public.contracts(id),
  amount numeric,
  status text,
  payment_method text,
  ...
);
```

---

## ⚙️ Nova Regra de Cálculo

1. Para cada contrato (`contracts.id`), buscar **todos os pagamentos** na tabela `payments` onde:
   - `payments.contract_id = contracts.id`
   - `payments.status = 'pago'`
   - `payments.payment_method` seja `'downPayment'` **ou** `'normalPayment'`

2. Somar o campo `amount` desses pagamentos.

3. Calcular a **porcentagem da entrada** da seguinte forma:

   ```text
   porcentagem_entrada = (soma_pagamentos / valor_total_contrato) * 100
   ```

4. Esse cálculo deve ser atualizado automaticamente em:
   - Exibições de contrato (tela e API)
   - Exportações e relatórios financeiros

---

## 🧠 Exemplo de SQL (para referência do backend)

```sql
SELECT
    c.id AS contract_id,
    ROUND(
        (COALESCE(SUM(p.amount), 0) / NULLIF(c.value, 0)) * 100,
        2
    ) AS porcentagem_entrada
FROM public.contracts c
LEFT JOIN public.payments p
    ON p.contract_id = c.id
    AND p.status = 'pago'
    AND p.payment_method IN ('downPayment', 'normalPayment')
GROUP BY c.id, c.value;
```

---

## ✅ Critérios de Aceite

- O cálculo **deve considerar todos os pagamentos pagos** (`status = 'pago'`).
- Pagamentos de ambos os tipos (`downPayment` e `normalPayment`) devem ser somados.
- Contratos sem pagamentos devem retornar `0%`.
- O cálculo deve estar disponível:
  - Nas telas de contrato.
  - Em endpoints de API.
  - Em exportações ou relatórios.
- O campo `contracts.down_payment` pode ser mantido apenas para registro histórico, **não como base de cálculo**.

---

## 💡 Observação (opcional)

Se desejado, é possível manter sincronizado o campo `contracts.down_payment` com a soma real dos pagamentos efetuados, para compatibilidade com versões antigas do sistema:

```sql
UPDATE public.contracts c
SET down_payment = COALESCE(pagamentos.total_pago, 0)
FROM (
    SELECT
        p.contract_id,
        SUM(p.amount) AS total_pago
    FROM public.payments p
    WHERE p.status = 'pago'
      AND p.payment_method IN ('downPayment', 'normalPayment')
    GROUP BY p.contract_id
) AS pagamentos
WHERE c.id = pagamentos.contract_id;
```
