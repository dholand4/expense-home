/**
 * Normalise a Prisma record for frontend consumption:
 *  - created_by       → resolved to creator email (from included `creator` relation)
 *  - created_at       → created_date
 *  - updated_at       → updated_date
 *  - Decimal          → number
 *  - Date-only fields → "YYYY-MM-DD" string (prevents UTC midnight → UTC-3 day shift in browser)
 *  - `creator`        relation object is stripped from output
 */

// Fields that represent calendar dates (no time component).
// Prisma returns them as Date at midnight UTC; if the browser uses getMonth() in UTC-3
// the day shifts back and e.g. "2026-06-01" becomes "May 31".
const DATE_ONLY_FIELDS = new Set(['first_charge_date', 'paid_date']);

function toDateString(d) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function convertValue(key, val) {
  if (val === null || val === undefined) return val;
  if (typeof val === 'object' && typeof val.toNumber === 'function') return val.toNumber();
  if (DATE_ONLY_FIELDS.has(key) && val instanceof Date) return toDateString(val);
  return val;
}

export function formatRecord(record) {
  if (!record) return null;
  const { created_at, updated_at, creator, created_by, ...rest } = record;

  const out = {};
  for (const [k, v] of Object.entries(rest)) {
    out[k] = convertValue(k, v);
  }

  return {
    ...out,
    created_by: creator?.email ?? created_by,
    created_date: created_at,
    updated_date: updated_at,
  };
}

export const INCLUDE_CREATOR = { creator: { select: { email: true } } };
