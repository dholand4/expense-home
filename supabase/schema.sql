-- ==============================================================================
-- EXPENSE HOME - SUPABASE DATABASE SCHEMA
-- ==============================================================================
-- Execute este arquivo no SQL Editor do seu painel Supabase.
-- ==============================================================================

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TIPOS ENUM
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE user_status AS ENUM ('active', 'invited', 'disabled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_type AS ENUM ('avista', 'parcelado', 'recorrente');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE expense_category AS ENUM (
    'alimentacao', 'transporte', 'moradia', 'saude', 'educacao',
    'lazer', 'vestuario', 'tecnologia', 'assinaturas',
    'financiamento', 'emprestimo', 'pet', 'outros'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE source_type AS ENUM ('card', 'bill_account');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE shared_access_status AS ENUM ('pending', 'accepted', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. TABELAS

-- Usuários / Perfis (sincronizados com auth.users do Supabase)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'user',
  status user_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cartões de Crédito
CREATE TABLE IF NOT EXISTS public.cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  credit_limit DECIMAL(12, 2) NOT NULL,
  due_day INTEGER NOT NULL,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Contas / Boletos
CREATE TABLE IF NOT EXISTS public.bill_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  due_day INTEGER,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Despesas / Lançamentos
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  description TEXT NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  installments INTEGER NOT NULL DEFAULT 1,
  first_charge_date DATE NOT NULL,
  payment_type payment_type NOT NULL DEFAULT 'avista',
  category expense_category,
  source_type source_type NOT NULL,
  source_id UUID NOT NULL,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pagamentos de Parcelas
CREATE TABLE IF NOT EXISTS public.installment_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expense_id UUID NOT NULL REFERENCES public.expenses(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  paid_amount DECIMAL(12, 2) NOT NULL,
  paid_date DATE NOT NULL,
  month_key VARCHAR(7) NOT NULL,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pagamentos de Faturas de Cartão
CREATE TABLE IF NOT EXISTS public.card_invoice_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  month_key VARCHAR(7) NOT NULL,
  paid_amount DECIMAL(12, 2) NOT NULL,
  paid_date DATE NOT NULL,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Dívidas em Andamento
CREATE TABLE IF NOT EXISTS public.running_debts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  amount_paid DECIMAL(12, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Transações / Extrato de Dívidas (Fiados)
CREATE TABLE IF NOT EXISTS public.running_debt_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  debt_id UUID NOT NULL REFERENCES public.running_debts(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'charge' (novo gasto/compra) ou 'payment' (pagamento abatido)
  amount DECIMAL(12, 2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Compartilhamento de Acesso
CREATE TABLE IF NOT EXISTS public.shared_accesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_email TEXT NOT NULL REFERENCES public.users(email) ON DELETE CASCADE,
  shared_with_email TEXT NOT NULL,
  status shared_access_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT shared_accesses_unique_pair UNIQUE (owner_email, shared_with_email)
);

-- 4. ÍNDICES DE PERFORMANCE
CREATE INDEX IF NOT EXISTS cards_created_by_idx ON public.cards(created_by);
CREATE INDEX IF NOT EXISTS bill_accounts_created_by_idx ON public.bill_accounts(created_by);
CREATE INDEX IF NOT EXISTS expenses_created_by_idx ON public.expenses(created_by);
CREATE INDEX IF NOT EXISTS expenses_source_type_source_id_idx ON public.expenses(source_type, source_id);
CREATE INDEX IF NOT EXISTS installment_payments_created_by_idx ON public.installment_payments(created_by);
CREATE INDEX IF NOT EXISTS installment_payments_expense_id_idx ON public.installment_payments(expense_id);
CREATE INDEX IF NOT EXISTS installment_payments_month_key_idx ON public.installment_payments(month_key);
CREATE INDEX IF NOT EXISTS card_invoice_payments_created_by_idx ON public.card_invoice_payments(created_by);
CREATE INDEX IF NOT EXISTS card_invoice_payments_card_id_idx ON public.card_invoice_payments(card_id);
CREATE INDEX IF NOT EXISTS card_invoice_payments_month_key_idx ON public.card_invoice_payments(month_key);
CREATE INDEX IF NOT EXISTS running_debts_created_by_idx ON public.running_debts(created_by);
CREATE INDEX IF NOT EXISTS running_debt_transactions_debt_id_idx ON public.running_debt_transactions(debt_id);
CREATE INDEX IF NOT EXISTS running_debt_transactions_created_by_idx ON public.running_debt_transactions(created_by);
CREATE INDEX IF NOT EXISTS running_debt_transactions_date_idx ON public.running_debt_transactions(date);
CREATE INDEX IF NOT EXISTS shared_accesses_owner_email_idx ON public.shared_accesses(owner_email);
CREATE INDEX IF NOT EXISTS shared_accesses_shared_with_email_idx ON public.shared_accesses(shared_with_email);

-- 5. TRIGGERS: UPDATED_AT AUTOMÁTICO
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER trigger_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TRIGGER trigger_cards_updated_at BEFORE UPDATE ON public.cards FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TRIGGER trigger_bill_accounts_updated_at BEFORE UPDATE ON public.bill_accounts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TRIGGER trigger_expenses_updated_at BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TRIGGER trigger_installment_payments_updated_at BEFORE UPDATE ON public.installment_payments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TRIGGER trigger_card_invoice_payments_updated_at BEFORE UPDATE ON public.card_invoice_payments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TRIGGER trigger_running_debts_updated_at BEFORE UPDATE ON public.running_debts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TRIGGER trigger_running_debt_transactions_updated_at BEFORE UPDATE ON public.running_debt_transactions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TRIGGER trigger_shared_accesses_updated_at BEFORE UPDATE ON public.shared_accesses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 6. TRIGGER: SINCRONIZAR USUÁRIOS DO SUPABASE AUTH COM PUBLIC.USERS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  assigned_role public.user_role := 'user';
  user_count INT;
BEGIN
  -- Se for o primeiro usuário cadastrado no sistema, torna-o 'admin'
  SELECT COUNT(*) INTO user_count FROM public.users;
  IF user_count = 0 THEN
    assigned_role := 'admin';
  END IF;

  INSERT INTO public.users (id, email, full_name, role, status)
  VALUES (
    NEW.id,
    LOWER(TRIM(NEW.email)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    assigned_role,
    'active'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name);

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user error: %', SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE OF email, raw_user_meta_data ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
