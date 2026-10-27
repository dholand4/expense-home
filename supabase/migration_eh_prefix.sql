-- ==============================================================================
-- MIGRATION: PREFIXO eh_ NAS TABELAS DO EXPENSE HOME
-- ==============================================================================
-- O projeto Supabase é compartilhado com outros apps (cs_*, dcast_*), então todos
-- os objetos deste app passam a usar o prefixo eh_.
--
-- Só usa RENAME: os dados, grants, RLS, policies, FKs e gatilhos continuam nas
-- mesmas tabelas/funções (o Postgres referencia tudo por OID, não por nome).
-- Não toca em cs_*, dcast_* nem em rls_auto_enable.
-- ==============================================================================

-- 1. TABELAS
ALTER TABLE public.users RENAME TO eh_users;
ALTER TABLE public.cards RENAME TO eh_cards;
ALTER TABLE public.bill_accounts RENAME TO eh_bill_accounts;
ALTER TABLE public.expenses RENAME TO eh_expenses;
ALTER TABLE public.installment_payments RENAME TO eh_installment_payments;
ALTER TABLE public.card_invoice_payments RENAME TO eh_card_invoice_payments;
ALTER TABLE public.running_debts RENAME TO eh_running_debts;
ALTER TABLE public.shared_accesses RENAME TO eh_shared_accesses;
ALTER TABLE public.running_debt_transactions RENAME TO eh_running_debt_transactions;
ALTER TABLE public.incomes RENAME TO eh_incomes;

-- 2. CONSTRAINTS, ÍNDICES E GATILHOS updated_at (evita colisão de nomes no schema compartilhado)
DO $$
DECLARE
  t TEXT;
  r RECORD;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'eh_users', 'eh_cards', 'eh_bill_accounts', 'eh_expenses', 'eh_installment_payments',
    'eh_card_invoice_payments', 'eh_running_debts', 'eh_shared_accesses',
    'eh_running_debt_transactions', 'eh_incomes'
  ] LOOP
    -- Renomear a constraint também renomeia o índice que a sustenta (pkey/unique)
    FOR r IN
      SELECT conname FROM pg_constraint
      WHERE conrelid = format('public.%I', t)::regclass AND conname NOT LIKE 'eh\_%'
    LOOP
      EXECUTE format('ALTER TABLE public.%I RENAME CONSTRAINT %I TO %I', t, r.conname, 'eh_' || r.conname);
    END LOOP;

    FOR r IN
      SELECT c.relname FROM pg_index i JOIN pg_class c ON c.oid = i.indexrelid
      WHERE i.indrelid = format('public.%I', t)::regclass AND c.relname NOT LIKE 'eh\_%'
    LOOP
      EXECUTE format('ALTER INDEX public.%I RENAME TO %I', r.relname, 'eh_' || r.relname);
    END LOOP;

    FOR r IN
      SELECT tgname FROM pg_trigger
      WHERE tgrelid = format('public.%I', t)::regclass AND NOT tgisinternal AND tgname LIKE 'trigger\_%\_updated\_at'
    LOOP
      EXECUTE format('ALTER TRIGGER %I ON public.%I RENAME TO %I', r.tgname, t, 'trigger_' || t || '_updated_at');
    END LOOP;
  END LOOP;
END $$;

-- 3. TIPO
ALTER TYPE public.user_role RENAME TO eh_user_role;

-- 4. FUNÇÕES
-- RENAME mantém o OID: os gatilhos trigger_eh_*_updated_at, as policies (que chamam
-- get_viewable_user_ids) e o gatilho on_auth_user_created em auth.users passam a
-- apontar automaticamente para as funções com o nome novo.
ALTER FUNCTION public.set_updated_at() RENAME TO eh_set_updated_at;
ALTER FUNCTION public.eh_set_updated_at() SET search_path = '';
ALTER FUNCTION public.get_viewable_user_ids() RENAME TO eh_get_viewable_user_ids;
ALTER FUNCTION public.handle_new_user() RENAME TO eh_handle_new_user;

-- Corpos recriados com os nomes novos (CREATE OR REPLACE preserva owner e grants)
CREATE OR REPLACE FUNCTION public.eh_get_viewable_user_ids()
RETURNS TABLE(user_id uuid)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  curr_email TEXT;
BEGIN
  SELECT email INTO curr_email FROM public.eh_users WHERE id = auth.uid();

  RETURN QUERY
  SELECT auth.uid()
  UNION
  SELECT u.id
  FROM public.eh_shared_accesses sa
  JOIN public.eh_users u ON u.email = sa.owner_email
  WHERE sa.shared_with_email = curr_email
    AND sa.status = 'accepted';
END;
$function$;

CREATE OR REPLACE FUNCTION public.eh_handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  assigned_role public.eh_user_role := 'user';
  user_count INT;
BEGIN
  SELECT COUNT(*) INTO user_count FROM public.eh_users;
  IF user_count = 0 THEN
    assigned_role := 'admin';
  END IF;

  INSERT INTO public.eh_users (id, email, full_name, role, status)
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
    full_name = COALESCE(EXCLUDED.full_name, public.eh_users.full_name);

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'eh_handle_new_user error: %', SQLERRM;
  RETURN NEW;
END;
$function$;
