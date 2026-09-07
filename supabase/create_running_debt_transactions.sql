-- ==============================================================================
-- CRIAÇÃO DA TABELA DE EXTRATO E TRANSAÇÕES DE FIADO (RUNNING_DEBT_TRANSACTIONS)
-- Execute no SQL Editor do seu painel Supabase
-- ==============================================================================

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

-- Índices para alta performance
CREATE INDEX IF NOT EXISTS running_debt_transactions_debt_id_idx ON public.running_debt_transactions(debt_id);
CREATE INDEX IF NOT EXISTS running_debt_transactions_created_by_idx ON public.running_debt_transactions(created_by);
CREATE INDEX IF NOT EXISTS running_debt_transactions_date_idx ON public.running_debt_transactions(date);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.running_debt_transactions ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
DROP POLICY IF EXISTS "Ver transacoes de dividas proprias e compartilhadas" ON public.running_debt_transactions;
CREATE POLICY "Ver transacoes de dividas proprias e compartilhadas"
  ON public.running_debt_transactions FOR SELECT
  TO authenticated
  USING (created_by IN (SELECT user_id FROM public.get_viewable_user_ids()));

DROP POLICY IF EXISTS "Criar transacoes de dividas próprias" ON public.running_debt_transactions;
CREATE POLICY "Criar transacoes de dividas próprias"
  ON public.running_debt_transactions FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Atualizar transacoes de dividas próprias" ON public.running_debt_transactions;
CREATE POLICY "Atualizar transacoes de dividas próprias"
  ON public.running_debt_transactions FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Excluir transacoes de dividas próprias" ON public.running_debt_transactions;
CREATE POLICY "Excluir transacoes de dividas próprias"
  ON public.running_debt_transactions FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());
