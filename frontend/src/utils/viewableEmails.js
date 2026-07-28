// Backend now handles shared-access filtering on every list endpoint.
// These functions are kept as no-ops to avoid breaking remaining imports.
export async function getViewableEmails() { return []; }
export function invalidateViewableEmails() {}
