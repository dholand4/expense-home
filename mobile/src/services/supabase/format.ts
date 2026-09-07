export function formatSupabaseRecord<T>(record: any): T {
  if (!record) return record;
  const { created_at, updated_at, users, ...rest } = record;
  const out: any = { ...rest };

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
  } as T;
}
