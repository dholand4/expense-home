-- ==============================================================================
-- MIGRATION: INCOMES TABLE
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.incomes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  description TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  person_name TEXT NOT NULL,
  is_recurring BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS incomes_created_by_idx ON public.incomes(created_by);

-- Trigger updated_at
CREATE TRIGGER trigger_incomes_updated_at BEFORE UPDATE ON public.incomes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;

-- Política: Ver receitas próprias e de quem compartilhou acesso
DROP POLICY IF EXISTS "Ver receitas próprias e compartilhadas" ON public.incomes;
CREATE POLICY "Ver receitas próprias e compartilhadas"
  ON public.incomes FOR SELECT
  TO authenticated
  USING (
    created_by IN (SELECT user_id FROM public.get_viewable_user_ids())
  );

-- Política: Criar receitas próprias
DROP POLICY IF EXISTS "Criar receitas próprias" ON public.incomes;
CREATE POLICY "Criar receitas próprias"
  ON public.incomes FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Política: Atualizar receitas próprias
DROP POLICY IF EXISTS "Atualizar receitas próprias" ON public.incomes;
CREATE POLICY "Atualizar receitas próprias"
  ON public.incomes FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- Política: Excluir receitas próprias
DROP POLICY IF EXISTS "Excluir receitas próprias" ON public.incomes;
CREATE POLICY "Excluir receitas próprias"
  ON public.incomes FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());
