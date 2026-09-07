-- ==============================================================================
-- EXPENSE HOME - ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
-- Execute este arquivo no SQL Editor do Supabase após executar o schema.sql.
-- ==============================================================================

-- 1. HABILITAR RLS EM TODAS AS TABELAS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installment_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_invoice_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.running_debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_accesses ENABLE ROW LEVEL SECURITY;

-- 2. FUNÇÃO AUXILIAR: IDENTIFICAR IDS DE USUÁRIOS VISÍVEIS
-- Retorna o ID do próprio usuário + os IDs de usuários que concederam acesso compartilhado aceito
CREATE OR REPLACE FUNCTION public.get_viewable_user_ids()
RETURNS TABLE (user_id UUID)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  curr_email TEXT;
BEGIN
  SELECT email INTO curr_email FROM public.users WHERE id = auth.uid();

  RETURN QUERY
  SELECT auth.uid()
  UNION
  SELECT u.id
  FROM public.shared_accesses sa
  JOIN public.users u ON u.email = sa.owner_email
  WHERE sa.shared_with_email = curr_email
    AND sa.status = 'accepted';
END;
$$;

-- 3. POLÍTICAS: PUBLIC.USERS
DROP POLICY IF EXISTS "Usuários autenticados podem ver perfis" ON public.users;
CREATE POLICY "Usuários autenticados podem ver perfis"
  ON public.users FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Permitir inserção de usuários" ON public.users;
CREATE POLICY "Permitir inserção de usuários"
  ON public.users FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios dados ou admin" ON public.users;
CREATE POLICY "Usuários podem atualizar seus próprios dados ou admin"
  ON public.users FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id
    OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

DROP POLICY IF EXISTS "Admin pode deletar usuários" ON public.users;
CREATE POLICY "Admin pode deletar usuários"
  ON public.users FOR DELETE
  TO authenticated
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- 4. POLÍTICAS: CARDS
DROP POLICY IF EXISTS "Ver cartões próprios e compartilhados" ON public.cards;
CREATE POLICY "Ver cartões próprios e compartilhados"
  ON public.cards FOR SELECT
  TO authenticated
  USING (created_by IN (SELECT user_id FROM public.get_viewable_user_ids()));

DROP POLICY IF EXISTS "Criar cartões próprios" ON public.cards;
CREATE POLICY "Criar cartões próprios"
  ON public.cards FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Atualizar cartões próprios" ON public.cards;
CREATE POLICY "Atualizar cartões próprios"
  ON public.cards FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Excluir cartões próprios" ON public.cards;
CREATE POLICY "Excluir cartões próprios"
  ON public.cards FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- 5. POLÍTICAS: BILL_ACCOUNTS
DROP POLICY IF EXISTS "Ver contas próprias e compartilhadas" ON public.bill_accounts;
CREATE POLICY "Ver contas próprias e compartilhadas"
  ON public.bill_accounts FOR SELECT
  TO authenticated
  USING (created_by IN (SELECT user_id FROM public.get_viewable_user_ids()));

DROP POLICY IF EXISTS "Criar contas próprias" ON public.bill_accounts;
CREATE POLICY "Criar contas próprias"
  ON public.bill_accounts FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Atualizar contas próprias" ON public.bill_accounts;
CREATE POLICY "Atualizar contas próprias"
  ON public.bill_accounts FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Excluir contas próprias" ON public.bill_accounts;
CREATE POLICY "Excluir contas próprias"
  ON public.bill_accounts FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- 6. POLÍTICAS: EXPENSES
DROP POLICY IF EXISTS "Ver despesas próprias e compartilhadas" ON public.expenses;
CREATE POLICY "Ver despesas próprias e compartilhadas"
  ON public.expenses FOR SELECT
  TO authenticated
  USING (created_by IN (SELECT user_id FROM public.get_viewable_user_ids()));

DROP POLICY IF EXISTS "Criar despesas próprias" ON public.expenses;
CREATE POLICY "Criar despesas próprias"
  ON public.expenses FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Atualizar despesas próprias" ON public.expenses;
CREATE POLICY "Atualizar despesas próprias"
  ON public.expenses FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Excluir despesas próprias" ON public.expenses;
CREATE POLICY "Excluir despesas próprias"
  ON public.expenses FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- 7. POLÍTICAS: INSTALLMENT_PAYMENTS
DROP POLICY IF EXISTS "Ver pagamentos de parcelas próprios e compartilhados" ON public.installment_payments;
CREATE POLICY "Ver pagamentos de parcelas próprios e compartilhados"
  ON public.installment_payments FOR SELECT
  TO authenticated
  USING (created_by IN (SELECT user_id FROM public.get_viewable_user_ids()));

DROP POLICY IF EXISTS "Criar pagamentos de parcelas" ON public.installment_payments;
CREATE POLICY "Criar pagamentos de parcelas"
  ON public.installment_payments FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Atualizar pagamentos de parcelas próprios" ON public.installment_payments;
CREATE POLICY "Atualizar pagamentos de parcelas próprios"
  ON public.installment_payments FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Excluir pagamentos de parcelas próprios" ON public.installment_payments;
CREATE POLICY "Excluir pagamentos de parcelas próprios"
  ON public.installment_payments FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- 8. POLÍTICAS: CARD_INVOICE_PAYMENTS
DROP POLICY IF EXISTS "Ver pagamentos de faturas próprios e compartilhados" ON public.card_invoice_payments;
CREATE POLICY "Ver pagamentos de faturas próprios e compartilhados"
  ON public.card_invoice_payments FOR SELECT
  TO authenticated
  USING (created_by IN (SELECT user_id FROM public.get_viewable_user_ids()));

DROP POLICY IF EXISTS "Criar pagamentos de faturas" ON public.card_invoice_payments;
CREATE POLICY "Criar pagamentos de faturas"
  ON public.card_invoice_payments FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Atualizar pagamentos de faturas próprios" ON public.card_invoice_payments;
CREATE POLICY "Atualizar pagamentos de faturas próprios"
  ON public.card_invoice_payments FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Excluir pagamentos de faturas próprios" ON public.card_invoice_payments;
CREATE POLICY "Excluir pagamentos de faturas próprios"
  ON public.card_invoice_payments FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- 9. POLÍTICAS: RUNNING_DEBTS
DROP POLICY IF EXISTS "Ver dívidas próprias e compartilhadas" ON public.running_debts;
CREATE POLICY "Ver dívidas próprias e compartilhadas"
  ON public.running_debts FOR SELECT
  TO authenticated
  USING (created_by IN (SELECT user_id FROM public.get_viewable_user_ids()));

DROP POLICY IF EXISTS "Criar dívidas próprias" ON public.running_debts;
CREATE POLICY "Criar dívidas próprias"
  ON public.running_debts FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Atualizar dívidas próprias" ON public.running_debts;
CREATE POLICY "Atualizar dívidas próprias"
  ON public.running_debts FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Excluir dívidas próprias" ON public.running_debts;
CREATE POLICY "Excluir dívidas próprias"
  ON public.running_debts FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- 9.1 POLÍTICAS: RUNNING_DEBT_TRANSACTIONS
ALTER TABLE public.running_debt_transactions ENABLE ROW LEVEL SECURITY;

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

-- 10. POLÍTICAS: SHARED_ACCESSES
DROP POLICY IF EXISTS "Ver compartilhamentos como proprietário ou convidado" ON public.shared_accesses;
CREATE POLICY "Ver compartilhamentos como proprietário ou convidado"
  ON public.shared_accesses FOR SELECT
  TO authenticated
  USING (
    owner_email = (SELECT email FROM public.users WHERE id = auth.uid())
    OR shared_with_email = (SELECT email FROM public.users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Criar convite de compartilhamento como proprietário" ON public.shared_accesses;
CREATE POLICY "Criar convite de compartilhamento como proprietário"
  ON public.shared_accesses FOR INSERT
  TO authenticated
  WITH CHECK (
    owner_email = (SELECT email FROM public.users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Atualizar status de compartilhamento" ON public.shared_accesses;
CREATE POLICY "Atualizar status de compartilhamento"
  ON public.shared_accesses FOR UPDATE
  TO authenticated
  USING (
    owner_email = (SELECT email FROM public.users WHERE id = auth.uid())
    OR shared_with_email = (SELECT email FROM public.users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Remover compartilhamento" ON public.shared_accesses;
CREATE POLICY "Remover compartilhamento"
  ON public.shared_accesses FOR DELETE
  TO authenticated
  USING (
    owner_email = (SELECT email FROM public.users WHERE id = auth.uid())
    OR shared_with_email = (SELECT email FROM public.users WHERE id = auth.uid())
  );
