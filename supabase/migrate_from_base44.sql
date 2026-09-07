-- ==============================================================================
-- MIGRAÇÃO DE DADOS: BASE44 -> SUPABASE
-- Contas, Cartões, Despesas e Parcelas (Sem Fiados)
-- ==============================================================================

DO $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
BEGIN
  -- 1. Localizar o usuário autenticado no Supabase
  SELECT id, email INTO v_user_id, v_user_email 
  FROM auth.users 
  ORDER BY created_at ASC 
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Nenhum usuário encontrado em auth.users. Crie uma conta no app antes de rodar a migração.';
  END IF;

  RAISE NOTICE 'Migrando dados para o usuário: % (ID: %)', v_user_email, v_user_id;

  -- 2. Garantir registro em public.users
  INSERT INTO public.users (id, email, full_name, role, status)
  VALUES (v_user_id, v_user_email, 'Daniel Holanda', 'admin', 'active')
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

  -- 3. INSERIR CONTAS / FONTES (9 BillAccounts)
  INSERT INTO public.bill_accounts (id, name, description, due_day, created_by, created_at, updated_at)
  VALUES ('00000000-6a71-ca57-8776-0003f82de4ad', 'Cartão Santander', '', 8, v_user_id, '2026-08-04T11:17:43.616000', NOW())
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, due_day = EXCLUDED.due_day;
  INSERT INTO public.bill_accounts (id, name, description, due_day, created_by, created_at, updated_at)
  VALUES ('00000000-6a71-c978-5a32-6d0ee9e84937', 'Pai Flávio', '', 12, v_user_id, '2026-08-04T11:14:00.227000', NOW())
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, due_day = EXCLUDED.due_day;
  INSERT INTO public.bill_accounts (id, name, description, due_day, created_by, created_at, updated_at)
  VALUES ('00000000-69fa-4da1-aa0b-4996af647e60', 'Arlete', '', 5, v_user_id, '2026-05-05T20:05:53.611000', NOW())
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, due_day = EXCLUDED.due_day;
  INSERT INTO public.bill_accounts (id, name, description, due_day, created_by, created_at, updated_at)
  VALUES ('00000000-69f3-27f4-3b1a-b00b76f415d6', 'Contas de Casa', '', 10, v_user_id, '2026-04-30T09:59:16.064000', NOW())
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, due_day = EXCLUDED.due_day;
  INSERT INTO public.bill_accounts (id, name, description, due_day, created_by, created_at, updated_at)
  VALUES ('00000000-69f2-bafa-8540-48d7b2b537e9', 'Cleiton', 'Pix', 10, v_user_id, '2026-04-30T02:14:18.852000', NOW())
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, due_day = EXCLUDED.due_day;
  INSERT INTO public.bill_accounts (id, name, description, due_day, created_by, created_at, updated_at)
  VALUES ('00000000-69f2-b83c-0269-b0e4cd59b923', 'Nayane', 'Pix', 5, v_user_id, '2026-04-30T02:02:36.414000', NOW())
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, due_day = EXCLUDED.due_day;
  INSERT INTO public.bill_accounts (id, name, description, due_day, created_by, created_at, updated_at)
  VALUES ('00000000-69f2-b789-9db8-cd2c187f0944', 'Davilla', 'Pix', 5, v_user_id, '2026-04-30T01:59:37.401000', NOW())
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, due_day = EXCLUDED.due_day;
  INSERT INTO public.bill_accounts (id, name, description, due_day, created_by, created_at, updated_at)
  VALUES ('00000000-69f2-b655-584a-f471e85aa8e4', 'Alex', 'Pix', 5, v_user_id, '2026-04-30T01:54:29.189000', NOW())
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, due_day = EXCLUDED.due_day;
  INSERT INTO public.bill_accounts (id, name, description, due_day, created_by, created_at, updated_at)
  VALUES ('00000000-69f2-ab23-e5a2-c209b422e8ea', 'Cartão Itaú (Vó)', 'Fatura', 12, v_user_id, '2026-04-30T01:06:43.563000', NOW())
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, due_day = EXCLUDED.due_day;

  -- 4. INSERIR DESPESAS / LANÇAMENTOS (54 Expenses)
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-6a9b-6194-c33f-e29ccdd6a152', 'Fatura Setembro', 2258.32, 1, '2026-09-08', 'avista', 'outros', 'bill_account', '00000000-6a71-ca57-8776-0003f82de4ad', v_user_id, '2026-09-05T00:25:56.878000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-6a7b-4983-a24d-38ef51bd14f6', 'Faculdade Mãe', 522.00, 12, '2026-09-05', 'parcelado', 'outros', 'bill_account', '00000000-69f2-b789-9db8-cd2c187f0944', v_user_id, '2026-08-11T16:10:43.714000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-6a76-6f83-d9e4-ca43545d7c00', 'CleytonNogueira - Macbook', 10800.00, 12, '2026-09-12', 'parcelado', 'tecnologia', 'bill_account', '00000000-69f2-ab23-e5a2-c209b422e8ea', v_user_id, '2026-08-07T23:51:31.526000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-6a76-6f0d-9b8f-73b06107906a', 'Aluguel', 8400.00, 12, '2026-09-15', 'parcelado', 'moradia', 'bill_account', '00000000-69f3-27f4-3b1a-b00b76f415d6', v_user_id, '2026-08-07T23:49:33.628000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-6a71-ca93-e93f-4225963f4fdb', 'Exclusiva', 129.00, 1, '2026-08-04', 'avista', 'outros', 'bill_account', '00000000-69fa-4da1-aa0b-4996af647e60', v_user_id, '2026-08-04T11:18:43.411000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-6a71-ca73-c986-8d2af8fad9c0', 'Fatura Agosto', 2178.39, 1, '2026-08-08', 'avista', 'outros', 'bill_account', '00000000-6a71-ca57-8776-0003f82de4ad', v_user_id, '2026-08-04T11:18:11.883000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-6a71-c98e-0911-6564172ea5f3', 'Dinheiro', 1200.00, 1, '2026-08-12', 'avista', 'alimentacao', 'bill_account', '00000000-6a71-c978-5a32-6d0ee9e84937', v_user_id, '2026-08-04T11:14:22.533000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-6a71-c959-4735-958e42185ecc', 'Outros', 105.47, 1, '2026-08-12', 'avista', 'outros', 'bill_account', '00000000-69f2-ab23-e5a2-c209b422e8ea', v_user_id, '2026-08-04T11:13:29.530000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-6a71-c8fd-02b4-fbc0e206b9f3', 'Bicicleta Quintina', 450.00, 4, '2026-08-05', 'parcelado', 'outros', 'bill_account', '00000000-69f2-b789-9db8-cd2c187f0944', v_user_id, '2026-08-04T11:11:57.879000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-6a62-4723-2280-9c7b8378f69e', 'NicolleRodrigues - Relógio Quintina', 249.90, 10, '2026-08-12', 'parcelado', 'outros', 'bill_account', '00000000-69f2-ab23-e5a2-c209b422e8ea', v_user_id, '2026-07-23T16:53:55.125000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-6a62-45bf-ccc0-8467d4f01e88', 'Nosso Atacarejo', 298.60, 1, '2026-08-12', 'avista', 'transporte', 'bill_account', '00000000-69f2-ab23-e5a2-c209b422e8ea', v_user_id, '2026-07-23T16:47:59.696000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-6a62-4568-0cac-52a7978dc765', 'Posto Quinzinho', 339.75, 1, '2026-08-12', 'avista', 'transporte', 'bill_account', '00000000-69f2-ab23-e5a2-c209b422e8ea', v_user_id, '2026-07-23T16:46:32.266000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-6a54-c03f-bda2-e413e4eeaf8d', 'Empréstimo Casa - Cleiton', 18000.00, 12, '2026-08-12', 'parcelado', 'emprestimo', 'bill_account', '00000000-69f2-ab23-e5a2-c209b422e8ea', v_user_id, '2026-07-13T10:38:55.467000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-6a4c-db1c-7881-46e78c3f57ea', 'Outros', 89.70, 1, '2026-07-07', 'avista', 'emprestimo', 'bill_account', '00000000-69f2-ab23-e5a2-c209b422e8ea', v_user_id, '2026-07-07T10:55:24.330000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-6a4b-9110-f430-d4c103394176', 'Blusas Brasil', 398.04, 3, '2026-07-12', 'parcelado', 'outros', 'bill_account', '00000000-69f2-ab23-e5a2-c209b422e8ea', v_user_id, '2026-07-06T11:27:12.641000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-6a45-455e-1e5d-864f78453866', 'Pinheiro Supermercado', 113.66, 1, '2026-07-12', 'avista', 'alimentacao', 'bill_account', '00000000-69f2-ab23-e5a2-c209b422e8ea', v_user_id, '2026-07-01T16:50:38.618000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-6a45-454b-7410-1bd4c95c72d7', 'Quintina', 21.28, 1, '2026-07-12', 'avista', 'emprestimo', 'bill_account', '00000000-69f2-ab23-e5a2-c209b422e8ea', v_user_id, '2026-07-01T16:50:19.668000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-6a45-453b-d5dd-9bdf1f561f32', 'Quintina', 30.00, 1, '2026-07-12', 'avista', 'emprestimo', 'bill_account', '00000000-69f2-ab23-e5a2-c209b422e8ea', v_user_id, '2026-07-01T16:50:03.155000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-6a45-452b-f260-00abbbc3c80c', 'Atacarejo', 238.02, 1, '2026-07-12', 'avista', 'alimentacao', 'bill_account', '00000000-69f2-ab23-e5a2-c209b422e8ea', v_user_id, '2026-07-01T16:49:47.696000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-6a45-44f7-a4a6-105f7a6fb31f', 'Posto', 200.00, 1, '2026-07-12', 'avista', 'transporte', 'bill_account', '00000000-69f2-ab23-e5a2-c209b422e8ea', v_user_id, '2026-07-01T16:48:55.069000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-6a45-44c0-6dc4-37cb580c0714', 'DanielHolanda - (Docs Casa)', 2010.00, 6, '2026-07-12', 'parcelado', 'moradia', 'bill_account', '00000000-69f2-ab23-e5a2-c209b422e8ea', v_user_id, '2026-07-01T16:48:00.936000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-6a45-449b-0e8e-5f22239f7603', 'Quintina (Peça Carro)', 400.00, 4, '2026-07-12', 'parcelado', 'transporte', 'bill_account', '00000000-69f2-ab23-e5a2-c209b422e8ea', v_user_id, '2026-07-01T16:47:23.676000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-6a27-1113-f864-44d45df2fc90', 'Energia', 199.42, 1, '2026-07-08', 'avista', 'moradia', 'bill_account', '00000000-69f3-27f4-3b1a-b00b76f415d6', v_user_id, '2026-06-08T18:59:31.748000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-6a27-10d8-2848-58f09a4beb0c', 'Água', 70.43, 1, '2026-07-08', 'avista', 'moradia', 'bill_account', '00000000-69f3-27f4-3b1a-b00b76f415d6', v_user_id, '2026-06-08T18:58:32.775000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-6a27-0f98-28e8-7cfebb537d0b', 'Empréstimo Bruno (danielholanda)', 2700.00, 6, '2026-07-12', 'parcelado', 'saude', 'bill_account', '00000000-69f2-ab23-e5a2-c209b422e8ea', v_user_id, '2026-06-08T18:53:12.641000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-6a24-55d7-a2c0-5c4586706d98', 'Diferença', 889.11, 1, '2026-06-12', 'avista', 'outros', 'bill_account', '00000000-69f2-ab23-e5a2-c209b422e8ea', v_user_id, '2026-06-06T17:16:07.079000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-69ff-79b4-c06d-4c9485c37804', 'Vestido - Natália Lira', 250.00, 3, '2026-06-05', 'parcelado', 'vestuario', 'bill_account', '00000000-69fa-4da1-aa0b-4996af647e60', v_user_id, '2026-05-09T18:15:16.541000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-69fb-1fc6-c9e1-3e2f7bd0dd7a', 'Água', 69.69, 1, '2026-06-10', 'avista', 'moradia', 'bill_account', '00000000-69f3-27f4-3b1a-b00b76f415d6', v_user_id, '2026-05-06T11:02:30.012000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-69fb-1f98-35d2-665aa57e992c', 'Energia', 199.42, 1, '2026-06-10', 'avista', 'moradia', 'bill_account', '00000000-69f3-27f4-3b1a-b00b76f415d6', v_user_id, '2026-05-06T11:01:44.655000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-69fb-0ef9-5fa4-2018a344a884', 'Projeto', 1000.00, 1, '2026-05-08', 'avista', 'outros', 'bill_account', '00000000-69f2-bafa-8540-48d7b2b537e9', v_user_id, '2026-05-06T09:50:49.015000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-69fa-4dbd-e363-cf8d9e895c45', 'Roupas Renner', 113.00, 1, '2026-06-05', 'avista', 'vestuario', 'bill_account', '00000000-69fa-4da1-aa0b-4996af647e60', v_user_id, '2026-05-05T20:06:21.378000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-69f9-ca3a-7d6b-1b1f2dd8e1fa', 'Daniel Holanda', 150.00, 1, '2026-05-12', 'avista', 'emprestimo', 'bill_account', '00000000-69f2-ab23-e5a2-c209b422e8ea', v_user_id, '2026-05-05T10:45:14.465000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-69f3-4174-3de9-686b319a6609', 'Água', 69.85, 1, '2026-05-10', 'avista', 'moradia', 'bill_account', '00000000-69f3-27f4-3b1a-b00b76f415d6', v_user_id, '2026-04-30T11:48:04.713000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-69f3-2826-bd81-cc87bba1714c', 'Energia', 218.53, 1, '2026-05-10', 'avista', 'moradia', 'bill_account', '00000000-69f3-27f4-3b1a-b00b76f415d6', v_user_id, '2026-04-30T10:00:06.765000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-69f2-bbc6-de60-04519a16d2a7', 'Dinheiro', 2360.00, 10, '2026-03-10', 'avista', 'emprestimo', 'bill_account', '00000000-69f2-bafa-8540-48d7b2b537e9', v_user_id, '2026-04-30T02:17:42.785000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-69f2-ba2b-89e6-9e6e1bd9cdfd', 'Dinheiro', 1200.00, 5, '2026-04-05', 'avista', 'emprestimo', 'bill_account', '00000000-69f2-b83c-0269-b0e4cd59b923', v_user_id, '2026-04-30T02:10:51.125000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-69f2-b80b-2f07-d42379996300', 'Telescópio Pai', 177.00, 3, '2026-05-05', 'avista', 'outros', 'bill_account', '00000000-69f2-b789-9db8-cd2c187f0944', v_user_id, '2026-04-30T02:01:47.583000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-69f2-b7a9-d522-2a63682e4cd1', 'Bicicleta', 1400.00, 7, '2026-05-05', 'avista', 'lazer', 'bill_account', '00000000-69f2-b789-9db8-cd2c187f0944', v_user_id, '2026-04-30T02:00:09.474000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-69f2-b6e5-4401-8780216055de', 'Empréstimo Carro', 14400.00, 24, '2025-12-05', 'avista', 'financiamento', 'bill_account', '00000000-69f2-b655-584a-f471e85aa8e4', v_user_id, '2026-04-30T01:56:53.609000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-69f2-a045-f8bb-bfe9b8d42b7e', 'MF Eletronicos', 4070.00, 10, '2025-08-12', 'avista', 'tecnologia', 'bill_account', '00000000-69f2-ab23-e5a2-c209b422e8ea', v_user_id, '2026-04-30T00:20:21.741000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-69f2-a045-f8bb-bfe9b8d42b7f', 'DanielHolanda', 5250.00, 10, '2025-09-12', 'avista', 'emprestimo', 'bill_account', '00000000-69f2-ab23-e5a2-c209b422e8ea', v_user_id, '2026-04-30T00:20:21.741000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-69f2-a045-f8bb-bfe9b8d42b80', 'DanielHolanda', 2300.00, 10, '2025-10-12', 'avista', 'emprestimo', 'bill_account', '00000000-69f2-ab23-e5a2-c209b422e8ea', v_user_id, '2026-04-30T00:20:21.741000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-69f2-a045-f8bb-bfe9b8d42b81', 'ProdutosUol', 210.48, 12, '2026-01-12', 'avista', 'assinaturas', 'bill_account', '00000000-69f2-ab23-e5a2-c209b422e8ea', v_user_id, '2026-04-30T00:20:21.741000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-69f2-a045-f8bb-bfe9b8d42b82', 'N E L Fernandes', 1200.00, 10, '2025-12-12', 'avista', 'transporte', 'bill_account', '00000000-69f2-ab23-e5a2-c209b422e8ea', v_user_id, '2026-04-30T00:20:21.741000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-69f2-a045-f8bb-bfe9b8d42b83', 'Livraria Di Livros', 1176.72, 8, '2025-12-12', 'avista', 'educacao', 'bill_account', '00000000-69f2-ab23-e5a2-c209b422e8ea', v_user_id, '2026-04-30T00:20:21.741000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-69f2-a045-f8bb-bfe9b8d42b84', 'MercadoLivre', 400.00, 10, '2025-12-12', 'avista', 'lazer', 'bill_account', '00000000-69f2-ab23-e5a2-c209b422e8ea', v_user_id, '2026-04-30T00:20:21.741000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-69f2-a045-f8bb-bfe9b8d42b85', 'Amazon*Samsung', 3319.44, 12, '2025-12-12', 'avista', 'tecnologia', 'bill_account', '00000000-69f2-ab23-e5a2-c209b422e8ea', v_user_id, '2026-04-30T00:20:21.741000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-69f2-a045-f8bb-bfe9b8d42b86', 'DanielHolanda', 2500.00, 10, '2026-01-12', 'avista', 'emprestimo', 'bill_account', '00000000-69f2-ab23-e5a2-c209b422e8ea', v_user_id, '2026-04-30T00:20:21.741000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-69f2-a045-f8bb-bfe9b8d42b87', 'DanielHolanda', 1526.04, 6, '2026-01-12', 'avista', 'emprestimo', 'bill_account', '00000000-69f2-ab23-e5a2-c209b422e8ea', v_user_id, '2026-04-30T00:20:21.741000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-69f2-a045-f8bb-bfe9b8d42b88', 'Mikaelly Optica', 1750.00, 7, '2026-02-12', 'avista', 'saude', 'bill_account', '00000000-69f2-ab23-e5a2-c209b422e8ea', v_user_id, '2026-04-30T00:20:21.741000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-69f2-a045-f8bb-bfe9b8d42b89', 'Ilario Neto & Nascimento (Atrativa)', 315.96, 4, '2026-02-12', 'avista', 'vestuario', 'bill_account', '00000000-69f2-ab23-e5a2-c209b422e8ea', v_user_id, '2026-04-30T00:20:21.741000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-69f2-a045-f8bb-bfe9b8d42b8a', 'AF man e Woman', 307.04, 4, '2026-02-12', 'avista', 'vestuario', 'bill_account', '00000000-69f2-ab23-e5a2-c209b422e8ea', v_user_id, '2026-04-30T00:20:21.741000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-69f2-a045-f8bb-bfe9b8d42b8b', 'Amazon Br (Mesa)', 483.03, 9, '2026-03-12', 'avista', 'tecnologia', 'bill_account', '00000000-69f2-ab23-e5a2-c209b422e8ea', v_user_id, '2026-04-30T00:20:21.741000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;
  INSERT INTO public.expenses (id, description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by, created_at, updated_at)
  VALUES ('00000000-69f2-a045-f8bb-bfe9b8d42b8c', 'Credito Pessoal', 44803.20, 60, '2022-09-12', 'avista', 'emprestimo', 'bill_account', '00000000-69f2-ab23-e5a2-c209b422e8ea', v_user_id, '2026-04-30T00:20:21.741000', NOW())
  ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, total_amount = EXCLUDED.total_amount;

  -- 5. INSERIR PAGAMENTOS DE PARCELAS (225 InstallmentPayments)
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a9d-4a63-89fa-98a2ad196839', '00000000-69f2-b6e5-4401-8780216055de', 10, 600.00, '2026-09-06', '2026-09', v_user_id, '2026-09-06T11:11:31.693000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a9d-4a5d-b76f-2aed3ff91ff3', '00000000-6a9b-6194-c33f-e29ccdd6a152', 1, 2258.32, '2026-09-06', '2026-09', v_user_id, '2026-09-06T11:11:25.671000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a9d-48ca-45d2-2a24e56cbcd5', '00000000-69f2-b7a9-d522-2a63682e4cd1', 5, 200.00, '2026-09-06', '2026-09', v_user_id, '2026-09-06T11:04:42.649000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a9d-48ca-6569-1f95fd47a40e', '00000000-6a71-c8fd-02b4-fbc0e206b9f3', 2, 112.50, '2026-09-06', '2026-09', v_user_id, '2026-09-06T11:04:42.634000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a9d-48ca-f788-4d9c7f533459', '00000000-6a7b-4983-a24d-38ef51bd14f6', 1, 43.50, '2026-09-06', '2026-09', v_user_id, '2026-09-06T11:04:42.629000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a9d-48b9-5f0e-29b921950fa2', '00000000-69f2-bbc6-de60-04519a16d2a7', 7, 236.00, '2026-09-06', '2026-09', v_user_id, '2026-09-06T11:04:25.518000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a76-6ebf-a3d9-81389c217a65', '00000000-69f2-a045-f8bb-bfe9b8d42b85', 9, 276.62, '2026-08-07', '2026-08', v_user_id, '2026-08-07T23:48:15.862000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a76-6ebf-a343-419e09759551', '00000000-69f2-a045-f8bb-bfe9b8d42b84', 9, 40.00, '2026-08-07', '2026-08', v_user_id, '2026-08-07T23:48:15.768000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a76-6ebf-132c-9c72fc33f42f', '00000000-69f2-a045-f8bb-bfe9b8d42b81', 8, 17.54, '2026-08-07', '2026-08', v_user_id, '2026-08-07T23:48:15.767000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a76-6ebf-bc62-16a7b01aa90b', '00000000-6a45-449b-0e8e-5f22239f7603', 2, 100.00, '2026-08-07', '2026-08', v_user_id, '2026-08-07T23:48:15.761000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a76-6ebf-ca55-66e9ae23a589', '00000000-69f2-a045-f8bb-bfe9b8d42b8c', 48, 746.72, '2026-08-07', '2026-08', v_user_id, '2026-08-07T23:48:15.760000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a76-6ebf-6513-10c2283046d9', '00000000-69f2-a045-f8bb-bfe9b8d42b82', 9, 120.00, '2026-08-07', '2026-08', v_user_id, '2026-08-07T23:48:15.753000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a76-6ebf-9b8d-7d957a64cbbe', '00000000-69f2-a045-f8bb-bfe9b8d42b88', 7, 250.00, '2026-08-07', '2026-08', v_user_id, '2026-08-07T23:48:15.750000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a76-6ebf-a76d-708cdc25533b', '00000000-69f2-a045-f8bb-bfe9b8d42b8b', 6, 53.67, '2026-08-07', '2026-08', v_user_id, '2026-08-07T23:48:15.748000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a76-6ebf-df73-9c87bd1c9240', '00000000-69f2-a045-f8bb-bfe9b8d42b86', 8, 250.00, '2026-08-07', '2026-08', v_user_id, '2026-08-07T23:48:15.748000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a76-6ebf-3b13-28585e77e5ac', '00000000-6a71-c959-4735-958e42185ecc', 1, 105.47, '2026-08-07', '2026-08', v_user_id, '2026-08-07T23:48:15.501000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a76-6ebf-2261-d8c278f27b99', '00000000-6a4b-9110-f430-d4c103394176', 2, 132.68, '2026-08-07', '2026-08', v_user_id, '2026-08-07T23:48:15.449000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a76-6ebf-be69-85e689072190', '00000000-6a27-0f98-28e8-7cfebb537d0b', 2, 450.00, '2026-08-07', '2026-08', v_user_id, '2026-08-07T23:48:15.444000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a76-6ebf-33fe-d59f2c473773', '00000000-6a45-44c0-6dc4-37cb580c0714', 2, 335.00, '2026-08-07', '2026-08', v_user_id, '2026-08-07T23:48:15.444000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a76-6ebf-bf6d-a3b73087de78', '00000000-6a62-4723-2280-9c7b8378f69e', 1, 24.99, '2026-08-07', '2026-08', v_user_id, '2026-08-07T23:48:15.441000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a76-6ebf-3584-de46160f63e9', '00000000-6a62-4568-0cac-52a7978dc765', 1, 339.75, '2026-08-07', '2026-08', v_user_id, '2026-08-07T23:48:15.441000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a76-6ebf-090b-0b2441c736e9', '00000000-6a62-45bf-ccc0-8467d4f01e88', 1, 298.60, '2026-08-07', '2026-08', v_user_id, '2026-08-07T23:48:15.437000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a76-6ebf-1622-49523acdaba2', '00000000-6a54-c03f-bda2-e413e4eeaf8d', 1, 1500.00, '2026-08-07', '2026-08', v_user_id, '2026-08-07T23:48:15.431000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a74-add9-7ad5-828ba0c4d4a7', '00000000-69f2-b6e5-4401-8780216055de', 9, 600.00, '2026-08-06', '2026-08', v_user_id, '2026-08-06T15:52:57.434000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a74-adc0-25c4-4953e8a074dc', '00000000-69f2-ba2b-89e6-9e6e1bd9cdfd', 5, 240.00, '2026-08-06', '2026-08', v_user_id, '2026-08-06T15:52:32.646000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a74-adba-3339-d68a0b43dbf5', '00000000-6a71-c98e-0911-6564172ea5f3', 1, 1200.00, '2026-08-06', '2026-08', v_user_id, '2026-08-06T15:52:26.112000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a74-adb2-63cc-7d042e84372e', '00000000-6a71-c8fd-02b4-fbc0e206b9f3', 1, 112.50, '2026-08-06', '2026-08', v_user_id, '2026-08-06T15:52:18.376000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a74-adb2-d2c2-01f2b50f0c54', '00000000-69f2-b7a9-d522-2a63682e4cd1', 4, 200.00, '2026-08-06', '2026-08', v_user_id, '2026-08-06T15:52:18.367000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a74-adae-e795-ed9d0f222c6a', '00000000-69f2-bbc6-de60-04519a16d2a7', 6, 236.00, '2026-08-06', '2026-08', v_user_id, '2026-08-06T15:52:14.072000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a73-d361-4e47-e45deacc0cfb', '00000000-6a71-ca73-c986-8d2af8fad9c0', 1, 600.00, '2026-08-05', '2026-08', v_user_id, '2026-08-06T00:20:49.566000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a71-cad8-7250-74aa6d2c6bc8', '00000000-69ff-79b4-c06d-4c9485c37804', 3, 83.33, '2026-08-04', '2026-08', v_user_id, '2026-08-04T11:19:52.780000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a71-cad8-6339-45e39bd2f78a', '00000000-6a71-ca93-e93f-4225963f4fdb', 1, 129.00, '2026-08-04', '2026-08', v_user_id, '2026-08-04T11:19:52.778000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a56-177c-dca3-85447b11e571', '00000000-69f2-bbc6-de60-04519a16d2a7', 5, 236.00, '2026-07-14', '2026-07', v_user_id, '2026-07-14T11:03:24.400000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a54-bfe8-9f52-fecc07cf8389', '00000000-69f2-b6e5-4401-8780216055de', 8, 600.00, '2026-07-13', '2026-07', v_user_id, '2026-07-13T10:37:28.558000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a54-bfda-3898-2eed2a206a74', '00000000-6a27-1113-f864-44d45df2fc90', 1, 199.42, '2026-07-13', '2026-07', v_user_id, '2026-07-13T10:37:14.751000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a54-bfda-f0e2-8d83bdaace66', '00000000-6a27-10d8-2848-58f09a4beb0c', 1, 70.43, '2026-07-13', '2026-07', v_user_id, '2026-07-13T10:37:14.735000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a54-bfd4-b95f-3d6c52521585', '00000000-69f2-a045-f8bb-bfe9b8d42b82', 8, 120.00, '2026-07-13', '2026-07', v_user_id, '2026-07-13T10:37:08.374000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a54-bfd4-3ab7-36e96b0b8657', '00000000-6a4b-9110-f430-d4c103394176', 1, 132.68, '2026-07-13', '2026-07', v_user_id, '2026-07-13T10:37:08.252000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a54-bfd4-655e-edba8351074d', '00000000-6a45-44c0-6dc4-37cb580c0714', 1, 335.00, '2026-07-13', '2026-07', v_user_id, '2026-07-13T10:37:08.247000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a54-bfd4-ffda-a73aa0df59c7', '00000000-6a27-0f98-28e8-7cfebb537d0b', 1, 450.00, '2026-07-13', '2026-07', v_user_id, '2026-07-13T10:37:08.238000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a54-bfd4-d7d4-13de5c6a2286', '00000000-69f2-a045-f8bb-bfe9b8d42b84', 8, 40.00, '2026-07-13', '2026-07', v_user_id, '2026-07-13T10:37:08.230000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a54-bfd4-9f52-fecc07cf8350', '00000000-6a45-453b-d5dd-9bdf1f561f32', 1, 30.00, '2026-07-13', '2026-07', v_user_id, '2026-07-13T10:37:08.224000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a54-bfd4-f976-c9136b8e9e26', '00000000-69f2-a045-f8bb-bfe9b8d42b86', 7, 250.00, '2026-07-13', '2026-07', v_user_id, '2026-07-13T10:37:08.019000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a54-bfd3-79d2-b1470a5bfcd6', '00000000-6a45-455e-1e5d-864f78453866', 1, 113.66, '2026-07-13', '2026-07', v_user_id, '2026-07-13T10:37:07.997000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a54-bfd3-3a79-916b6cb6e57f', '00000000-6a45-449b-0e8e-5f22239f7603', 1, 100.00, '2026-07-13', '2026-07', v_user_id, '2026-07-13T10:37:07.996000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a54-bfd3-fc81-0151df5f5fdf', '00000000-69f2-a045-f8bb-bfe9b8d42b88', 6, 250.00, '2026-07-13', '2026-07', v_user_id, '2026-07-13T10:37:07.995000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a54-bfd3-8a6f-df98b2b0d2a4', '00000000-6a4c-db1c-7881-46e78c3f57ea', 1, 89.70, '2026-07-13', '2026-07', v_user_id, '2026-07-13T10:37:07.992000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a54-bfd3-3a79-916b6cb6e57e', '00000000-6a45-44f7-a4a6-105f7a6fb31f', 1, 200.00, '2026-07-13', '2026-07', v_user_id, '2026-07-13T10:37:07.989000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a54-bfd3-1ec6-1c6fd99d2830', '00000000-69f2-a045-f8bb-bfe9b8d42b85', 8, 276.62, '2026-07-13', '2026-07', v_user_id, '2026-07-13T10:37:07.984000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a54-bfd3-e51a-e28887f527d3', '00000000-69f2-a045-f8bb-bfe9b8d42b80', 10, 230.00, '2026-07-13', '2026-07', v_user_id, '2026-07-13T10:37:07.984000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a54-bfd3-5fa6-8164dda1fbc6', '00000000-69f2-a045-f8bb-bfe9b8d42b81', 7, 17.54, '2026-07-13', '2026-07', v_user_id, '2026-07-13T10:37:07.975000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a54-bfd3-0a51-e0e57cce84b0', '00000000-69f2-a045-f8bb-bfe9b8d42b8b', 5, 53.67, '2026-07-13', '2026-07', v_user_id, '2026-07-13T10:37:07.972000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a54-bfd3-a26c-08ce10771888', '00000000-6a45-452b-f260-00abbbc3c80c', 1, 238.02, '2026-07-13', '2026-07', v_user_id, '2026-07-13T10:37:07.971000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a54-bfd3-b684-9b7b4dadaa0e', '00000000-69f2-a045-f8bb-bfe9b8d42b8c', 47, 746.72, '2026-07-13', '2026-07', v_user_id, '2026-07-13T10:37:07.970000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a54-bfd3-cdf7-2bc4312a2946', '00000000-6a45-454b-7410-1bd4c95c72d7', 1, 21.28, '2026-07-13', '2026-07', v_user_id, '2026-07-13T10:37:07.968000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a54-bfd3-ba48-9ab23383247a', '00000000-69f2-a045-f8bb-bfe9b8d42b83', 8, 147.09, '2026-07-13', '2026-07', v_user_id, '2026-07-13T10:37:07.967000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a48-3a4c-9a81-a59762e750f2', '00000000-69f2-b7a9-d522-2a63682e4cd1', 3, 200.00, '2026-07-03', '2026-07', v_user_id, '2026-07-03T22:40:12.523000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a48-3a4c-af18-f9b146568bd9', '00000000-69f2-b80b-2f07-d42379996300', 3, 59.00, '2026-07-03', '2026-07', v_user_id, '2026-07-03T22:40:12.193000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a45-460d-c270-8440a55ebdd8', '00000000-69ff-79b4-c06d-4c9485c37804', 2, 83.33, '2026-07-01', '2026-07', v_user_id, '2026-07-01T16:53:33.270000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a45-4605-daec-c3539a2452c3', '00000000-69f2-ba2b-89e6-9e6e1bd9cdfd', 4, 240.00, '2026-07-01', '2026-07', v_user_id, '2026-07-01T16:53:25.597000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a30-ac7a-0753-a5093774a2af', '00000000-69f2-a045-f8bb-bfe9b8d42b84', 7, 40.00, '2026-06-15', '2026-06', v_user_id, '2026-06-16T01:52:58.218000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a30-ac7a-87a7-06f475b98d60', '00000000-69f2-a045-f8bb-bfe9b8d42b82', 7, 120.00, '2026-06-15', '2026-06', v_user_id, '2026-06-16T01:52:58.206000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a30-ac7a-60c9-3d1d4da7d588', '00000000-69f2-a045-f8bb-bfe9b8d42b83', 7, 147.09, '2026-06-15', '2026-06', v_user_id, '2026-06-16T01:52:58.195000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a30-ac7a-0417-cfe0763c7ae2', '00000000-69f2-a045-f8bb-bfe9b8d42b88', 5, 250.00, '2026-06-15', '2026-06', v_user_id, '2026-06-16T01:52:58.164000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a30-ac7a-6359-7028890b60ab', '00000000-6a24-55d7-a2c0-5c4586706d98', 1, 889.11, '2026-06-15', '2026-06', v_user_id, '2026-06-16T01:52:58.135000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a30-ac79-4161-08b8031c5ef7', '00000000-69f2-a045-f8bb-bfe9b8d42b86', 6, 250.00, '2026-06-15', '2026-06', v_user_id, '2026-06-16T01:52:57.845000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a30-ac79-eb32-8b992684e136', '00000000-69f2-a045-f8bb-bfe9b8d42b7f', 10, 525.00, '2026-06-15', '2026-06', v_user_id, '2026-06-16T01:52:57.810000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a30-ac79-fa6c-781c4e4c8866', '00000000-69f2-a045-f8bb-bfe9b8d42b85', 7, 276.62, '2026-06-15', '2026-06', v_user_id, '2026-06-16T01:52:57.769000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a30-ac79-58d4-c6ab5dd5c8f1', '00000000-69f2-a045-f8bb-bfe9b8d42b8b', 4, 53.67, '2026-06-15', '2026-06', v_user_id, '2026-06-16T01:52:57.762000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a30-ac79-6576-5fa90a8aafe3', '00000000-69f2-a045-f8bb-bfe9b8d42b81', 6, 17.54, '2026-06-15', '2026-06', v_user_id, '2026-06-16T01:52:57.759000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a30-ac79-af5b-d17b84d4967f', '00000000-69f2-a045-f8bb-bfe9b8d42b8c', 46, 746.72, '2026-06-15', '2026-06', v_user_id, '2026-06-16T01:52:57.757000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a30-ac79-baf0-d44b4e3d2102', '00000000-69f2-a045-f8bb-bfe9b8d42b87', 6, 254.34, '2026-06-15', '2026-06', v_user_id, '2026-06-16T01:52:57.757000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a30-ac79-f5c9-a26926d8f538', '00000000-69f2-a045-f8bb-bfe9b8d42b80', 9, 230.00, '2026-06-15', '2026-06', v_user_id, '2026-06-16T01:52:57.753000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a27-0fa9-1f0b-27f2908f5673', '00000000-69fb-1f98-35d2-665aa57e992c', 1, 199.42, '2026-06-08', '2026-06', v_user_id, '2026-06-08T18:53:29.317000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a27-0fa7-f6d3-9d35b694b158', '00000000-69fb-1fc6-c9e1-3e2f7bd0dd7a', 1, 69.69, '2026-06-08', '2026-06', v_user_id, '2026-06-08T18:53:27.006000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a21-869f-cf95-a8848e6a365e', '00000000-69f2-b6e5-4401-8780216055de', 7, 600.00, '2026-06-04', '2026-06', v_user_id, '2026-06-04T14:07:27.067000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a21-8688-f3ec-264d95949c67', '00000000-69f2-b80b-2f07-d42379996300', 2, 59.00, '2026-06-04', '2026-06', v_user_id, '2026-06-04T14:07:04.868000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a21-8688-b7ee-230d4d0945e3', '00000000-69f2-b7a9-d522-2a63682e4cd1', 2, 200.00, '2026-06-04', '2026-06', v_user_id, '2026-06-04T14:07:04.561000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a21-8551-de5b-efc87d68a0d8', '00000000-69f2-bbc6-de60-04519a16d2a7', 4, 236.00, '2026-06-04', '2026-06', v_user_id, '2026-06-04T14:01:53.665000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a21-84e2-6d45-4ffbeed559b5', '00000000-69ff-79b4-c06d-4c9485c37804', 1, 83.33, '2026-06-04', '2026-06', v_user_id, '2026-06-04T14:00:02.363000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a21-84e2-a084-a8e45398cd6c', '00000000-69fa-4dbd-e363-cf8d9e895c45', 1, 113.00, '2026-06-04', '2026-06', v_user_id, '2026-06-04T14:00:02.256000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-6a20-e0c3-9c65-182c5f660b98', '00000000-69f2-ba2b-89e6-9e6e1bd9cdfd', 3, 240.00, '2026-06-03', '2026-06', v_user_id, '2026-06-04T02:19:47.634000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69fc-6f5b-1316-cf69b301f784', '00000000-69f2-a045-f8bb-bfe9b8d42b82', 6, 120.00, '2026-05-07', '2026-05', v_user_id, '2026-05-07T10:54:19.137000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69fc-6f5b-ab64-26fadd46a775', '00000000-69f2-a045-f8bb-bfe9b8d42b8a', 4, 76.76, '2026-05-07', '2026-05', v_user_id, '2026-05-07T10:54:19.129000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69fc-6f5b-705e-b2dbf04e4f8f', '00000000-69f2-a045-f8bb-bfe9b8d42b83', 6, 147.09, '2026-05-07', '2026-05', v_user_id, '2026-05-07T10:54:19.127000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69fc-6f5b-c0e9-fe6dec26aa65', '00000000-69f2-a045-f8bb-bfe9b8d42b88', 4, 250.00, '2026-05-07', '2026-05', v_user_id, '2026-05-07T10:54:19.127000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69fc-6f5b-97fb-5baf1f8de5a6', '00000000-69f2-a045-f8bb-bfe9b8d42b86', 5, 250.00, '2026-05-07', '2026-05', v_user_id, '2026-05-07T10:54:19.125000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69fc-6f5b-8e7b-503e442da56d', '00000000-69f2-a045-f8bb-bfe9b8d42b80', 8, 230.00, '2026-05-07', '2026-05', v_user_id, '2026-05-07T10:54:19.124000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69fc-6f5b-ed96-f013c53cca88', '00000000-69f2-a045-f8bb-bfe9b8d42b81', 5, 17.54, '2026-05-07', '2026-05', v_user_id, '2026-05-07T10:54:19.123000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69fc-6f5b-4313-b0a69fa6687a', '00000000-69f2-a045-f8bb-bfe9b8d42b7e', 10, 407.00, '2026-05-07', '2026-05', v_user_id, '2026-05-07T10:54:19.122000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69fc-6f5a-da1b-12f1d113fbeb', '00000000-69f2-a045-f8bb-bfe9b8d42b8b', 3, 53.67, '2026-05-07', '2026-05', v_user_id, '2026-05-07T10:54:18.914000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69fc-6f5a-d0a1-2ad4ff2d157c', '00000000-69f2-a045-f8bb-bfe9b8d42b84', 6, 40.00, '2026-05-07', '2026-05', v_user_id, '2026-05-07T10:54:18.880000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69fc-6f5a-d3b5-c6847b8a327a', '00000000-69f2-a045-f8bb-bfe9b8d42b87', 5, 254.34, '2026-05-07', '2026-05', v_user_id, '2026-05-07T10:54:18.878000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69fc-6f5a-5234-9a0eab58d53d', '00000000-69f2-a045-f8bb-bfe9b8d42b8c', 45, 746.72, '2026-05-07', '2026-05', v_user_id, '2026-05-07T10:54:18.877000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69fc-6f5a-ba14-0710c3467629', '00000000-69f2-a045-f8bb-bfe9b8d42b89', 4, 78.99, '2026-05-07', '2026-05', v_user_id, '2026-05-07T10:54:18.876000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69fc-6f5a-875c-68f892f305ab', '00000000-69f2-a045-f8bb-bfe9b8d42b7f', 9, 525.00, '2026-05-07', '2026-05', v_user_id, '2026-05-07T10:54:18.875000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69fc-6f5a-b472-13e1eda8a31f', '00000000-69f2-a045-f8bb-bfe9b8d42b85', 6, 276.62, '2026-05-07', '2026-05', v_user_id, '2026-05-07T10:54:18.875000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69fc-6f5a-e23e-00b4796ef268', '00000000-69f9-ca3a-7d6b-1b1f2dd8e1fa', 1, 150.00, '2026-05-07', '2026-05', v_user_id, '2026-05-07T10:54:18.874000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69fb-1e0e-6b20-93c2b1b9fd45', '00000000-69f3-2826-bd81-cc87bba1714c', 1, 218.53, '2026-05-06', '2026-05', v_user_id, '2026-05-06T10:55:10.789000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69fb-1db5-c578-f6056ff5f4c6', '00000000-69f2-bbc6-de60-04519a16d2a7', 3, 236.00, '2026-05-06', '2026-05', v_user_id, '2026-05-06T10:53:41.231000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69fb-1db5-278d-9d48ad436d0b', '00000000-69fb-0ef9-5fa4-2018a344a884', 1, 1000.00, '2026-05-06', '2026-05', v_user_id, '2026-05-06T10:53:41.225000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69fa-9a62-96cd-69c5f6fe7eef', '00000000-69f2-b6e5-4401-8780216055de', 6, 600.00, '2026-05-05', '2026-05', v_user_id, '2026-05-06T01:33:22.474000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3269', '00000000-69f2-a045-f8bb-bfe9b8d42b8c', 20, 746.72, '2026-04-30', '2024-04', v_user_id, '2026-05-02T16:03:17.221000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be326a', '00000000-69f2-a045-f8bb-bfe9b8d42b8c', 21, 746.72, '2026-04-30', '2024-05', v_user_id, '2026-05-02T16:03:17.221000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be326b', '00000000-69f2-a045-f8bb-bfe9b8d42b8c', 22, 746.72, '2026-04-30', '2024-06', v_user_id, '2026-05-02T16:03:17.221000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be326c', '00000000-69f2-a045-f8bb-bfe9b8d42b8c', 23, 746.72, '2026-04-30', '2024-07', v_user_id, '2026-05-02T16:03:17.221000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be326d', '00000000-69f2-a045-f8bb-bfe9b8d42b8c', 24, 746.72, '2026-04-30', '2024-08', v_user_id, '2026-05-02T16:03:17.221000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be326e', '00000000-69f2-a045-f8bb-bfe9b8d42b8c', 25, 746.72, '2026-04-30', '2024-09', v_user_id, '2026-05-02T16:03:17.221000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be326f', '00000000-69f2-a045-f8bb-bfe9b8d42b8c', 26, 746.72, '2026-04-30', '2024-10', v_user_id, '2026-05-02T16:03:17.221000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3270', '00000000-69f2-a045-f8bb-bfe9b8d42b8c', 27, 746.72, '2026-04-30', '2024-11', v_user_id, '2026-05-02T16:03:17.221000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3271', '00000000-69f2-a045-f8bb-bfe9b8d42b8c', 28, 746.72, '2026-04-30', '2024-12', v_user_id, '2026-05-02T16:03:17.221000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3272', '00000000-69f2-a045-f8bb-bfe9b8d42b8c', 29, 746.72, '2026-04-30', '2025-01', v_user_id, '2026-05-02T16:03:17.221000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3273', '00000000-69f2-a045-f8bb-bfe9b8d42b8c', 30, 746.72, '2026-04-30', '2025-02', v_user_id, '2026-05-02T16:03:17.221000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3274', '00000000-69f2-a045-f8bb-bfe9b8d42b8c', 31, 746.72, '2026-04-30', '2025-03', v_user_id, '2026-05-02T16:03:17.221000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3275', '00000000-69f2-a045-f8bb-bfe9b8d42b8c', 32, 746.72, '2026-04-30', '2025-04', v_user_id, '2026-05-02T16:03:17.221000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3276', '00000000-69f2-a045-f8bb-bfe9b8d42b8c', 33, 746.72, '2026-04-30', '2025-05', v_user_id, '2026-05-02T16:03:17.221000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3277', '00000000-69f2-a045-f8bb-bfe9b8d42b8c', 34, 746.72, '2026-04-30', '2025-06', v_user_id, '2026-05-02T16:03:17.221000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3278', '00000000-69f2-a045-f8bb-bfe9b8d42b8c', 35, 746.72, '2026-04-30', '2025-07', v_user_id, '2026-05-02T16:03:17.221000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3279', '00000000-69f2-a045-f8bb-bfe9b8d42b8c', 36, 746.72, '2026-04-30', '2025-08', v_user_id, '2026-05-02T16:03:17.221000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be327a', '00000000-69f2-a045-f8bb-bfe9b8d42b8c', 37, 746.72, '2026-04-30', '2025-09', v_user_id, '2026-05-02T16:03:17.221000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be327b', '00000000-69f2-a045-f8bb-bfe9b8d42b8c', 38, 746.72, '2026-04-30', '2025-10', v_user_id, '2026-05-02T16:03:17.221000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be327c', '00000000-69f2-a045-f8bb-bfe9b8d42b8c', 39, 746.72, '2026-04-30', '2025-11', v_user_id, '2026-05-02T16:03:17.221000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be327d', '00000000-69f2-a045-f8bb-bfe9b8d42b8c', 40, 746.72, '2026-04-30', '2025-12', v_user_id, '2026-05-02T16:03:17.221000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be327e', '00000000-69f2-a045-f8bb-bfe9b8d42b8c', 41, 746.72, '2026-04-30', '2026-01', v_user_id, '2026-05-02T16:03:17.221000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be327f', '00000000-69f2-a045-f8bb-bfe9b8d42b8c', 42, 746.72, '2026-04-30', '2026-02', v_user_id, '2026-05-02T16:03:17.221000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3285', '00000000-69f2-b6e5-4401-8780216055de', 1, 600.00, '2026-04-30', '2025-12', v_user_id, '2026-05-02T16:03:17.221000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3286', '00000000-69f2-b6e5-4401-8780216055de', 2, 600.00, '2026-04-30', '2026-01', v_user_id, '2026-05-02T16:03:17.221000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3287', '00000000-69f2-b6e5-4401-8780216055de', 3, 600.00, '2026-04-30', '2026-02', v_user_id, '2026-05-02T16:03:17.221000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be322f', '00000000-69f2-a045-f8bb-bfe9b8d42b7e', 1, 407.00, '2026-04-30', '2025-08', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3230', '00000000-69f2-a045-f8bb-bfe9b8d42b7e', 2, 407.00, '2026-04-30', '2025-09', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3231', '00000000-69f2-a045-f8bb-bfe9b8d42b7e', 3, 407.00, '2026-04-30', '2025-10', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3232', '00000000-69f2-a045-f8bb-bfe9b8d42b7e', 4, 407.00, '2026-04-30', '2025-11', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3233', '00000000-69f2-a045-f8bb-bfe9b8d42b7e', 5, 407.00, '2026-04-30', '2025-12', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3234', '00000000-69f2-a045-f8bb-bfe9b8d42b7e', 6, 407.00, '2026-04-30', '2026-01', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3235', '00000000-69f2-a045-f8bb-bfe9b8d42b7e', 7, 407.00, '2026-04-30', '2026-02', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3236', '00000000-69f2-a045-f8bb-bfe9b8d42b7f', 1, 525.00, '2026-04-30', '2025-09', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3237', '00000000-69f2-a045-f8bb-bfe9b8d42b7f', 2, 525.00, '2026-04-30', '2025-10', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3238', '00000000-69f2-a045-f8bb-bfe9b8d42b7f', 3, 525.00, '2026-04-30', '2025-11', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3239', '00000000-69f2-a045-f8bb-bfe9b8d42b7f', 4, 525.00, '2026-04-30', '2025-12', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be323a', '00000000-69f2-a045-f8bb-bfe9b8d42b7f', 5, 525.00, '2026-04-30', '2026-01', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be323b', '00000000-69f2-a045-f8bb-bfe9b8d42b7f', 6, 525.00, '2026-04-30', '2026-02', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be323c', '00000000-69f2-a045-f8bb-bfe9b8d42b80', 1, 230.00, '2026-04-30', '2025-10', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be323d', '00000000-69f2-a045-f8bb-bfe9b8d42b80', 2, 230.00, '2026-04-30', '2025-11', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be323e', '00000000-69f2-a045-f8bb-bfe9b8d42b80', 3, 230.00, '2026-04-30', '2025-12', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be323f', '00000000-69f2-a045-f8bb-bfe9b8d42b80', 4, 230.00, '2026-04-30', '2026-01', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3240', '00000000-69f2-a045-f8bb-bfe9b8d42b80', 5, 230.00, '2026-04-30', '2026-02', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3241', '00000000-69f2-a045-f8bb-bfe9b8d42b81', 1, 17.54, '2026-04-30', '2026-01', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3242', '00000000-69f2-a045-f8bb-bfe9b8d42b81', 2, 17.54, '2026-04-30', '2026-02', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3243', '00000000-69f2-a045-f8bb-bfe9b8d42b82', 1, 120.00, '2026-04-30', '2025-12', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3244', '00000000-69f2-a045-f8bb-bfe9b8d42b82', 2, 120.00, '2026-04-30', '2026-01', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3245', '00000000-69f2-a045-f8bb-bfe9b8d42b82', 3, 120.00, '2026-04-30', '2026-02', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3246', '00000000-69f2-a045-f8bb-bfe9b8d42b83', 1, 147.09, '2026-04-30', '2025-12', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3247', '00000000-69f2-a045-f8bb-bfe9b8d42b83', 2, 147.09, '2026-04-30', '2026-01', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3248', '00000000-69f2-a045-f8bb-bfe9b8d42b83', 3, 147.09, '2026-04-30', '2026-02', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3249', '00000000-69f2-a045-f8bb-bfe9b8d42b84', 1, 40.00, '2026-04-30', '2025-12', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be324a', '00000000-69f2-a045-f8bb-bfe9b8d42b84', 2, 40.00, '2026-04-30', '2026-01', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be324b', '00000000-69f2-a045-f8bb-bfe9b8d42b84', 3, 40.00, '2026-04-30', '2026-02', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be324c', '00000000-69f2-a045-f8bb-bfe9b8d42b85', 1, 276.62, '2026-04-30', '2025-12', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be324d', '00000000-69f2-a045-f8bb-bfe9b8d42b85', 2, 276.62, '2026-04-30', '2026-01', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be324e', '00000000-69f2-a045-f8bb-bfe9b8d42b85', 3, 276.62, '2026-04-30', '2026-02', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be324f', '00000000-69f2-a045-f8bb-bfe9b8d42b86', 1, 250.00, '2026-04-30', '2026-01', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3250', '00000000-69f2-a045-f8bb-bfe9b8d42b86', 2, 250.00, '2026-04-30', '2026-02', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3251', '00000000-69f2-a045-f8bb-bfe9b8d42b87', 1, 254.34, '2026-04-30', '2026-01', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3252', '00000000-69f2-a045-f8bb-bfe9b8d42b87', 2, 254.34, '2026-04-30', '2026-02', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3253', '00000000-69f2-a045-f8bb-bfe9b8d42b88', 1, 250.00, '2026-04-30', '2026-02', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3254', '00000000-69f2-a045-f8bb-bfe9b8d42b89', 1, 78.99, '2026-04-30', '2026-02', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3255', '00000000-69f2-a045-f8bb-bfe9b8d42b8a', 1, 76.76, '2026-04-30', '2026-02', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3256', '00000000-69f2-a045-f8bb-bfe9b8d42b8c', 1, 746.72, '2026-04-30', '2022-09', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3257', '00000000-69f2-a045-f8bb-bfe9b8d42b8c', 2, 746.72, '2026-04-30', '2022-10', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3258', '00000000-69f2-a045-f8bb-bfe9b8d42b8c', 3, 746.72, '2026-04-30', '2022-11', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3259', '00000000-69f2-a045-f8bb-bfe9b8d42b8c', 4, 746.72, '2026-04-30', '2022-12', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be325a', '00000000-69f2-a045-f8bb-bfe9b8d42b8c', 5, 746.72, '2026-04-30', '2023-01', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be325b', '00000000-69f2-a045-f8bb-bfe9b8d42b8c', 6, 746.72, '2026-04-30', '2023-02', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be325c', '00000000-69f2-a045-f8bb-bfe9b8d42b8c', 7, 746.72, '2026-04-30', '2023-03', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be325d', '00000000-69f2-a045-f8bb-bfe9b8d42b8c', 8, 746.72, '2026-04-30', '2023-04', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be325e', '00000000-69f2-a045-f8bb-bfe9b8d42b8c', 9, 746.72, '2026-04-30', '2023-05', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be325f', '00000000-69f2-a045-f8bb-bfe9b8d42b8c', 10, 746.72, '2026-04-30', '2023-06', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3260', '00000000-69f2-a045-f8bb-bfe9b8d42b8c', 11, 746.72, '2026-04-30', '2023-07', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3261', '00000000-69f2-a045-f8bb-bfe9b8d42b8c', 12, 746.72, '2026-04-30', '2023-08', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3262', '00000000-69f2-a045-f8bb-bfe9b8d42b8c', 13, 746.72, '2026-04-30', '2023-09', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3263', '00000000-69f2-a045-f8bb-bfe9b8d42b8c', 14, 746.72, '2026-04-30', '2023-10', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3264', '00000000-69f2-a045-f8bb-bfe9b8d42b8c', 15, 746.72, '2026-04-30', '2023-11', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3265', '00000000-69f2-a045-f8bb-bfe9b8d42b8c', 16, 746.72, '2026-04-30', '2023-12', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3266', '00000000-69f2-a045-f8bb-bfe9b8d42b8c', 17, 746.72, '2026-04-30', '2024-01', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3267', '00000000-69f2-a045-f8bb-bfe9b8d42b8c', 18, 746.72, '2026-04-30', '2024-02', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-2045-74c9-510906be3268', '00000000-69f2-a045-f8bb-bfe9b8d42b8c', 19, 746.72, '2026-04-30', '2024-03', v_user_id, '2026-05-02T16:03:17.220000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-1ddd-20ae-58a0d6080510', '00000000-69f2-a045-f8bb-bfe9b8d42b88', 2, 250.00, '2026-05-02', '2026-03', v_user_id, '2026-05-02T15:53:01.019000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-1ddc-bf17-9489667ead5a', '00000000-69f2-a045-f8bb-bfe9b8d42b81', 3, 17.54, '2026-05-02', '2026-03', v_user_id, '2026-05-02T15:53:00.998000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-1ddc-3a98-03415e87cc29', '00000000-69f2-a045-f8bb-bfe9b8d42b8b', 1, 53.67, '2026-05-02', '2026-03', v_user_id, '2026-05-02T15:53:00.994000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-1ddc-ad89-bbae2bab416f', '00000000-69f2-a045-f8bb-bfe9b8d42b86', 3, 250.00, '2026-05-02', '2026-03', v_user_id, '2026-05-02T15:53:00.990000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-1ddc-991a-a32da91bdea6', '00000000-69f2-a045-f8bb-bfe9b8d42b89', 2, 78.99, '2026-05-02', '2026-03', v_user_id, '2026-05-02T15:53:00.984000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-1ddc-1286-0f6a8b538c0d', '00000000-69f2-a045-f8bb-bfe9b8d42b83', 4, 147.09, '2026-05-02', '2026-03', v_user_id, '2026-05-02T15:53:00.966000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-1ddc-e934-8177b474df01', '00000000-69f2-a045-f8bb-bfe9b8d42b85', 4, 276.62, '2026-05-02', '2026-03', v_user_id, '2026-05-02T15:53:00.965000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-1ddc-cdb8-62399b8915e7', '00000000-69f2-a045-f8bb-bfe9b8d42b8a', 2, 76.76, '2026-05-02', '2026-03', v_user_id, '2026-05-02T15:53:00.963000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-1ddc-2399-4b44d2067c0c', '00000000-69f2-a045-f8bb-bfe9b8d42b84', 4, 40.00, '2026-05-02', '2026-03', v_user_id, '2026-05-02T15:53:00.948000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-1ddc-cdb8-62399b8915e6', '00000000-69f2-a045-f8bb-bfe9b8d42b80', 6, 230.00, '2026-05-02', '2026-03', v_user_id, '2026-05-02T15:53:00.875000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-1ddc-06d9-1dc50368f24a', '00000000-69f2-a045-f8bb-bfe9b8d42b8c', 43, 746.72, '2026-05-02', '2026-03', v_user_id, '2026-05-02T15:53:00.579000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-1ddc-10cb-0c2315b6aa08', '00000000-69f2-a045-f8bb-bfe9b8d42b82', 4, 120.00, '2026-05-02', '2026-03', v_user_id, '2026-05-02T15:53:00.571000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-1ddc-f47a-44dde8349ccb', '00000000-69f2-a045-f8bb-bfe9b8d42b7f', 7, 525.00, '2026-05-02', '2026-03', v_user_id, '2026-05-02T15:53:00.566000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-1ddc-cf02-b37ddaa66bab', '00000000-69f2-a045-f8bb-bfe9b8d42b87', 3, 254.34, '2026-05-02', '2026-03', v_user_id, '2026-05-02T15:53:00.556000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-1ddc-bc73-e616e8763b18', '00000000-69f2-a045-f8bb-bfe9b8d42b7e', 8, 407.00, '2026-05-02', '2026-03', v_user_id, '2026-05-02T15:53:00.547000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-1dd8-d542-d9eded65cb4f', '00000000-69f2-b6e5-4401-8780216055de', 4, 600.00, '2026-05-02', '2026-03', v_user_id, '2026-05-02T15:52:56.400000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-1dd4-7a9d-a123ee37f90f', '00000000-69f2-bbc6-de60-04519a16d2a7', 1, 236.00, '2026-05-02', '2026-03', v_user_id, '2026-05-02T15:52:52.227000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-01a4-45c2-c807955c7b4a', '00000000-69f2-a045-f8bb-bfe9b8d42b87', 4, 254.34, '2026-05-02', '2026-04', v_user_id, '2026-05-02T13:52:36.196000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-01a4-d3e2-1b0f34b3184a', '00000000-69f2-a045-f8bb-bfe9b8d42b8a', 3, 76.76, '2026-05-02', '2026-04', v_user_id, '2026-05-02T13:52:36.064000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-01a4-cace-9bfa50d2adf6', '00000000-69f2-a045-f8bb-bfe9b8d42b83', 5, 147.09, '2026-05-02', '2026-04', v_user_id, '2026-05-02T13:52:36.039000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-01a4-0787-556966ce30cc', '00000000-69f2-a045-f8bb-bfe9b8d42b89', 3, 78.99, '2026-05-02', '2026-04', v_user_id, '2026-05-02T13:52:36.027000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-01a4-440c-3781d8a2d41e', '00000000-69f2-a045-f8bb-bfe9b8d42b84', 5, 40.00, '2026-05-02', '2026-04', v_user_id, '2026-05-02T13:52:36.024000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-01a4-d18c-b9f78c9730de', '00000000-69f2-a045-f8bb-bfe9b8d42b8b', 2, 53.67, '2026-05-02', '2026-04', v_user_id, '2026-05-02T13:52:36.024000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-01a4-87e7-7e649ba95d07', '00000000-69f2-a045-f8bb-bfe9b8d42b88', 3, 250.00, '2026-05-02', '2026-04', v_user_id, '2026-05-02T13:52:36.023000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-01a4-7204-3a5c1047529b', '00000000-69f2-a045-f8bb-bfe9b8d42b8c', 44, 746.72, '2026-05-02', '2026-04', v_user_id, '2026-05-02T13:52:36.021000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-01a4-61cd-e2610e48e897', '00000000-69f2-a045-f8bb-bfe9b8d42b85', 5, 276.62, '2026-05-02', '2026-04', v_user_id, '2026-05-02T13:52:36.020000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-01a4-1b1a-70d53a56c150', '00000000-69f2-a045-f8bb-bfe9b8d42b82', 5, 120.00, '2026-05-02', '2026-04', v_user_id, '2026-05-02T13:52:36.018000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-01a4-baca-eb9a02721b69', '00000000-69f2-a045-f8bb-bfe9b8d42b86', 4, 250.00, '2026-05-02', '2026-04', v_user_id, '2026-05-02T13:52:36.013000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-019e-35b0-dd0c1c35fbf3', '00000000-69f2-a045-f8bb-bfe9b8d42b81', 4, 17.54, '2026-05-02', '2026-04', v_user_id, '2026-05-02T13:52:30.668000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-019c-d030-9a1e0fffb20c', '00000000-69f2-a045-f8bb-bfe9b8d42b80', 7, 230.00, '2026-05-02', '2026-04', v_user_id, '2026-05-02T13:52:28.115000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-0199-3dbc-77bc1638e194', '00000000-69f2-a045-f8bb-bfe9b8d42b7f', 8, 525.00, '2026-05-02', '2026-04', v_user_id, '2026-05-02T13:52:25.929000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-0197-819b-09a7b7569d45', '00000000-69f2-a045-f8bb-bfe9b8d42b7e', 9, 407.00, '2026-05-02', '2026-04', v_user_id, '2026-05-02T13:52:23.410000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-0192-1ab5-d508d78fda79', '00000000-69f2-bbc6-de60-04519a16d2a7', 2, 236.00, '2026-05-02', '2026-04', v_user_id, '2026-05-02T13:52:18.931000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-018c-f1d2-ab7ede7a1c2f', '00000000-69f2-b6e5-4401-8780216055de', 5, 600.00, '2026-05-02', '2026-04', v_user_id, '2026-05-02T13:52:12.543000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f6-018a-0f3e-1e75b8acb41a', '00000000-69f2-ba2b-89e6-9e6e1bd9cdfd', 1, 240.00, '2026-05-02', '2026-04', v_user_id, '2026-05-02T13:52:10.309000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f4-e143-eeee-5c60e6f7ace9', '00000000-69f3-4174-3de9-686b319a6609', 1, 69.85, '2026-05-01', '2026-05', v_user_id, '2026-05-01T17:22:11.497000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f4-9993-3495-2116c0072ddc', '00000000-69f2-b7a9-d522-2a63682e4cd1', 1, 200.00, '2026-05-01', '2026-05', v_user_id, '2026-05-01T12:16:19.895000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f4-9993-e4ec-3e3ddc9a82ce', '00000000-69f2-b80b-2f07-d42379996300', 1, 59.00, '2026-05-01', '2026-05', v_user_id, '2026-05-01T12:16:19.884000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;
  INSERT INTO public.installment_payments (id, expense_id, installment_number, paid_amount, paid_date, month_key, created_by, created_at, updated_at)
  VALUES ('00000000-69f4-98e7-1417-19119440adc2', '00000000-69f2-ba2b-89e6-9e6e1bd9cdfd', 2, 240.00, '2026-05-01', '2026-05', v_user_id, '2026-05-01T12:13:27.502000', NOW())
  ON CONFLICT (id) DO UPDATE SET paid_amount = EXCLUDED.paid_amount, paid_date = EXCLUDED.paid_date;

  RAISE NOTICE '✅ Migração concluída com sucesso!';
  RAISE NOTICE 'Fontes migradas: %', (SELECT COUNT(*) FROM public.bill_accounts WHERE created_by = v_user_id);
  RAISE NOTICE 'Despesas migradas: %', (SELECT COUNT(*) FROM public.expenses WHERE created_by = v_user_id);
  RAISE NOTICE 'Parcelas pagas migradas: %', (SELECT COUNT(*) FROM public.installment_payments WHERE created_by = v_user_id);
END $$;
