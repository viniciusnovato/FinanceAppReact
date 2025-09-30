-- Dados de teste para o ERP de Gestão de Pagamentos

-- Inserir clientes de teste
INSERT INTO clients (id, name, email, phone, address, document) VALUES
('11111111-1111-1111-1111-111111111111', 'João Silva', 'joao@email.com', '912345678', 'Rua A, 123', '123456789'),
('22222222-2222-2222-2222-222222222222', 'Maria Santos', 'maria@email.com', '923456789', 'Rua B, 456', '987654321'),
('33333333-3333-3333-3333-333333333333', 'Pedro Costa', 'pedro@email.com', '934567890', 'Rua C, 789', '456789123')
ON CONFLICT (id) DO NOTHING;

-- Inserir contratos de teste
INSERT INTO contracts (id, client_id, title, description, value, start_date, end_date, status) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Contrato 001', 'Serviços de consultoria', 5000.00, '2024-01-01', '2024-12-31', 'active'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'Contrato 002', 'Desenvolvimento de software', 10000.00, '2024-02-01', '2024-11-30', 'active'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'Contrato 003', 'Manutenção de sistemas', 3000.00, '2024-03-01', '2024-09-30', 'active')
ON CONFLICT (id) DO NOTHING;

-- Inserir pagamentos de teste
INSERT INTO payments (id, contract_id, amount, due_date, paid_date, status, payment_method, notes) VALUES
-- Pagamentos para Contrato 001 (João Silva)
('p1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1000.00, '2024-01-15', '2024-01-15', 'paid', 'bank_transfer', 'Primeira parcela'),
('p1111111-1111-1111-1111-111111111112', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1000.00, '2024-02-15', NULL, 'pending', NULL, 'Segunda parcela'),
('p1111111-1111-1111-1111-111111111113', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1000.00, '2024-03-15', NULL, 'pending', NULL, 'Terceira parcela'),

-- Pagamentos para Contrato 002 (Maria Santos)
('p2222222-2222-2222-2222-222222222221', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 2500.00, '2024-02-15', '2024-02-15', 'paid', 'credit_card', 'Primeira parcela'),
('p2222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 2500.00, '2024-04-15', NULL, 'pending', NULL, 'Segunda parcela'),
('p2222222-2222-2222-2222-222222222223', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 2500.00, '2024-06-15', NULL, 'pending', NULL, 'Terceira parcela'),

-- Pagamentos para Contrato 003 (Pedro Costa)
('p3333333-3333-3333-3333-333333333331', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 1500.00, '2024-03-15', '2024-03-15', 'paid', 'pix', 'Primeira parcela'),
('p3333333-3333-3333-3333-333333333332', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 1500.00, '2024-05-15', NULL, 'overdue', NULL, 'Segunda parcela - atrasada')
ON CONFLICT (id) DO NOTHING;