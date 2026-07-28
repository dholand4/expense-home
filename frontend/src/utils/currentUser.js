// Simplified — backend handles created_by via JWT; this utility is kept
// only to avoid breaking imports in files not yet migrated.
let _email = null;

export function setCurrentUserEmail(email) {
  _email = email;
}

export function getCurrentUserEmail() {
  return Promise.resolve(_email);
}

export function getCurrentUserEmailSync() {
  return _email;
}
