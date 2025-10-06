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

