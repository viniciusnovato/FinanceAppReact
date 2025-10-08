# 💳 Funcionalidade de Gestão de Pagamentos, Saldos Positivos e Negativos de Contrato

## 1. Pagamento automático (checkbox “Pago”)

- Ao clicar no **checkbox “Pago”** de uma parcela:
  - O `status` da parcela muda automaticamente para **`"paid"`**.
  - O `paid_amount` recebe o mesmo valor de `amount`.
  - Nenhuma ação adicional é executada — o sistema considera o pagamento integral da parcela.

> 🔹 Esse comportamento é padrão e automático.  
> 🔹 As regras abaixo aplicam-se **apenas quando o pagamento é manual** (ícone amarelo de dinheiro).

---

## 2. Pagamento manual (ícone amarelo 💰)

Ao clicar no ícone amarelo de dinheiro em uma parcela, o sistema abrirá um **modal de pagamento manual**.  
Esse modal deve permitir total flexibilidade no uso dos saldos do contrato.

### 2.1 Estrutura do modal
O modal deve conter:

- Campo para inserir **valor pago manualmente**.  
- Dois checkboxes opcionais:
  1. **☑️ Usar saldo positivo**
  2. **☑️ Pagar parte da dívida (saldo negativo)**

Quando o usuário marcar um checkbox:
- Deve aparecer um **input numérico** para digitar o valor desejado.
- O valor não pode ultrapassar o saldo disponível (positivo ou negativo).

---

## 3. Regras de cálculo em pagamento manual

O cálculo final da parcela deve acontecer **em tempo real** conforme o usuário digita.  
O sistema deve exibir dinamicamente o **novo valor da parcela a pagar**, aplicando a seguinte fórmula:

```
valor_final_da_parcela =
    (valor_original_da_parcela + valor_para_pagar_da_dívida)
    - valor_utilizado_do_saldo_positivo
```

### 3.1 Validações automáticas
- O valor usado do saldo positivo **não pode ser maior que o saldo positivo atual**.
- O valor pago da dívida **não pode ser maior que o saldo negativo atual**.
- O valor final da parcela **nunca pode ser negativo**.

---

## 4. Regras de negócio do pagamento

### 4.1 Pagamento menor que o valor da parcela
- Quando o **valor pago** for **menor** que o valor da parcela:
  - A diferença (`amount - paid_amount`) deve ser **somada ao `negative_balance`** do contrato.
  - O `negative_balance` representa o **valor em dívida** do paciente.
  - A parcela permanece **pendente** (`status = 'pending'`).

---

### 4.2 Pagamento maior que o valor da parcela
- Quando o **valor pago** for **maior** que o valor da parcela:
  - O excedente (`paid_amount - amount`) deve ser **somado ao `positive_balance`** do contrato.
  - O `positive_balance` representa **crédito disponível** para abater parcelas futuras.
  - A parcela é considerada **paga** (`status = 'paid'`).

---

### 4.3 Pagamento com uso de saldos (via modal manual)
- Se o usuário marcar “usar saldo positivo”:
  - O valor escolhido é **subtraído do `positive_balance`**.
  - O mesmo valor é **subtraído do valor da parcela**.
- Se o usuário marcar “pagar parte da dívida”:
  - O valor escolhido é **subtraído do `negative_balance`**.
  - O mesmo valor é **somado ao valor da parcela**.
- O cálculo final considera ambos os saldos simultaneamente.
- O valor da parcela é recalculado em tempo real conforme os valores são inseridos.

---

### 4.4 Situações especiais

#### a) Parcela zerada
- Se, após o cálculo, o valor da parcela for igual a **0**:
  - O sistema deve **marcar a parcela como paga automaticamente** (`status = 'paid'`).
  - Nenhuma movimentação financeira deve ser gerada.

#### b) Pagamento maior que o total (parcela + dívida)
- Se o pagamento superar o total (parcela + saldo negativo):
  - O excedente vai para o **`positive_balance`** do contrato.

#### c) Pagamento igual ao total (parcela + dívida)
- Se o pagamento for exatamente igual ao total:
  - A parcela é marcada como **paga** (`status = 'paid'`).
  - O saldo negativo é zerado.

---

## 5. Atualizações no contrato

Cada pagamento manual pode atualizar os seguintes campos na tabela `contracts`:

| Campo | Ação |
|--------|------|
| `positive_balance` | Incrementa ou reduz conforme o uso de saldo positivo. |
| `negative_balance` | Incrementa ou reduz conforme dívidas são geradas ou quitadas. |

Essas atualizações devem ocorrer imediatamente após a confirmação do pagamento.

---

## 6. Resumo do contrato (modal 👁️)

Ao clicar no **ícone de olho** na listagem de contratos, o modal deve exibir:

- **Saldo positivo** (`positive_balance`) — valor disponível em crédito.  
- **Saldo negativo** (`negative_balance`) — valor em dívida.  
- Ambos os valores devem ser atualizados **em tempo real** após qualquer pagamento manual.

Exemplo de exibição:
```
Saldo positivo: €120,00
Saldo negativo: €60,00
```

---

## 7. Regras complementares

- Todas as atualizações de status, saldos e valores são processadas **na camada de aplicação**.  
- O sistema deve refletir os cálculos **em tempo real** no modal e na tabela de parcelas.  
- Nenhuma trigger no banco de dados é necessária — as alterações devem ser persistidas pela aplicação.
- Caso o valor inserido resulte em uma parcela zerada, o status deve ser atualizado imediatamente para **“paid”**.

---

## 🧮 Fórmulas de referência

```
Se valor_pago < valor_parcela:
    negative_balance += (valor_parcela - valor_pago)

Se valor_pago > valor_parcela:
    positive_balance += (valor_pago - valor_parcela)

Se usar saldo positivo:
    valor_parcela -= valor_usado_saldo_positivo
    positive_balance -= valor_usado_saldo_positivo

Se pagar parte da dívida:
    valor_parcela += valor_pago_da_dívida
    negative_balance -= valor_pago_da_dívida
```

---

## ✅ **Resultado esperado**

- Sistema mais inteligente e dinâmico para gestão financeira.
- Cálculos transparentes e instantâneos.
- Redução de erros manuais e melhoria da experiência do usuário.
- Total rastreabilidade dos saldos positivos e negativos de cada contrato.
