-- ==============================================================================
-- MIGRATION: INCOMES TABLE
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.eh_incomes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  description TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  person_name TEXT NOT NULL,
  is_recurring BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES public.eh_users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS eh_incomes_created_by_idx ON public.eh_incomes(created_by);

-- Trigger updated_at
CREATE TRIGGER trigger_eh_incomes_updated_at BEFORE UPDATE ON public.eh_incomes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.eh_incomes ENABLE ROW LEVEL SECURITY;

-- Política: Ver receitas próprias e de quem compartilhou acesso
DROP POLICY IF EXISTS "Ver receitas próprias e compartilhadas" ON public.eh_incomes;
CREATE POLICY "Ver receitas próprias e compartilhadas"
  ON public.eh_incomes FOR SELECT
  TO authenticated
  USING (
    created_by IN (SELECT user_id FROM public.get_viewable_user_ids())
  );

-- Política: Criar receitas próprias
DROP POLICY IF EXISTS "Criar receitas próprias" ON public.eh_incomes;
CREATE POLICY "Criar receitas próprias"
  ON public.eh_incomes FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Política: Atualizar receitas próprias
DROP POLICY IF EXISTS "Atualizar receitas próprias" ON public.eh_incomes;
CREATE POLICY "Atualizar receitas próprias"
  ON public.eh_incomes FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- Política: Excluir receitas próprias
DROP POLICY IF EXISTS "Excluir receitas próprias" ON public.eh_incomes;
CREATE POLICY "Excluir receitas próprias"
  ON public.eh_incomes FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());
