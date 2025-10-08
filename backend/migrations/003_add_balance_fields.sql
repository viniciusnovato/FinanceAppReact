-- Migração para adicionar campos de saldo positivo e negativo nos contratos

-- Adicionar campos de saldo na tabela contracts
ALTER TABLE contracts 
ADD COLUMN IF NOT EXISTS positive_balance DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS negative_balance DECIMAL(10,2) DEFAULT 0;

-- Adicionar campos adicionais que estão no modelo mas podem não existir
ALTER TABLE contracts 
ADD COLUMN IF NOT EXISTS local VARCHAR(255),
ADD COLUMN IF NOT EXISTS area VARCHAR(255),
ADD COLUMN IF NOT EXISTS gestora VARCHAR(255),
ADD COLUMN IF NOT EXISTS medico VARCHAR(255),
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Adicionar campo paid_amount na tabela payments se não existir
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS external_id VARCHAR(255);

-- Adicionar campos adicionais na tabela clients se não existirem
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS mobile VARCHAR(20),
ADD COLUMN IF NOT EXISTS tax_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS city VARCHAR(255),
ADD COLUMN IF NOT EXISTS state VARCHAR(255),
ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS country VARCHAR(255),
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS external_id VARCHAR(255);

-- Migrar dados existentes se necessário
-- Se existe campo 'name' em clients, copiar para first_name
UPDATE clients 
SET first_name = name 
WHERE first_name IS NULL AND name IS NOT NULL;

-- Se existe campo 'document' em clients, copiar para tax_id
UPDATE clients 
SET tax_id = document 
WHERE tax_id IS NULL AND document IS NOT NULL;

-- Se existe campo 'title' em contracts, copiar para description
UPDATE contracts 
SET description = title 
WHERE description IS NULL AND title IS NOT NULL;

-- Criar índices para os novos campos
CREATE INDEX IF NOT EXISTS idx_contracts_positive_balance ON contracts(positive_balance);
CREATE INDEX IF NOT EXISTS idx_contracts_negative_balance ON contracts(negative_balance);
CREATE INDEX IF NOT EXISTS idx_payments_paid_amount ON payments(paid_amount);
CREATE INDEX IF NOT EXISTS idx_clients_tax_id ON clients(tax_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);

-- Comentários para documentação
COMMENT ON COLUMN contracts.positive_balance IS 'Saldo positivo do contrato (crédito disponível)';
COMMENT ON COLUMN contracts.negative_balance IS 'Saldo negativo do contrato (valor em dívida)';
COMMENT ON COLUMN payments.paid_amount IS 'Valor efetivamente pago da parcela';