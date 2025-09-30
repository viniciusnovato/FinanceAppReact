-- Migração para adicionar campos necessários para funcionalidade de pagamentos automáticos

-- Adicionar campos na tabela contracts
ALTER TABLE contracts 
ADD COLUMN IF NOT EXISTS down_payment DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS number_of_payments INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS payment_frequency VARCHAR(50) DEFAULT 'monthly',
ADD COLUMN IF NOT EXISTS contract_number VARCHAR(50);

-- Adicionar campo na tabela payments
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS payment_type VARCHAR(50) DEFAULT 'normalPayment';

-- Criar índices para os novos campos
CREATE INDEX IF NOT EXISTS idx_contracts_contract_number ON contracts(contract_number);
CREATE INDEX IF NOT EXISTS idx_payments_payment_type ON payments(payment_type);

-- Atualizar contratos existentes com números sequenciais se não tiverem
UPDATE contracts 
SET contract_number = 'CONT-' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 4, '0')
WHERE contract_number IS NULL OR contract_number = '';

-- Atualizar pagamentos existentes com payment_type padrão
UPDATE payments 
SET payment_type = 'normalPayment'
WHERE payment_type IS NULL OR payment_type = '';