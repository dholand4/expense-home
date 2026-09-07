/**
 * Normaliza os registros retornados pelo Supabase para manter 100% de compatibilidade
 * com o formato esperado pelos componentes do frontend:
 * - created_date / updated_date
 * - Conversão de tipos numéricos (DECIMAL -> number)
 * - Resolução do email do criador (created_by)
 */
export function formatSupabaseRecord(record) {
  if (!record) return null;
  const { created_at, updated_at, users, ...rest } = record;
  const out = { ...rest };

  if (out.credit_limit !== undefined && out.credit_limit !== null) {
    out.credit_limit = Number(out.credit_limit);
  }
  if (out.total_amount !== undefined && out.total_amount !== null) {
    out.total_amount = Number(out.total_amount);
  }
  if (out.paid_amount !== undefined && out.paid_amount !== null) {
    out.paid_amount = Number(out.paid_amount);
  }
  if (out.amount_paid !== undefined && out.amount_paid !== null) {
    out.amount_paid = Number(out.amount_paid);
  }

  return {
    ...out,
    created_by: users?.email ?? out.created_by,
    created_date: created_at,
    updated_date: updated_at,
  };
}
