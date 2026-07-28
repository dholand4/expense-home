import * as saService from '../services/sharedAccesses.service.js';

export async function list(req, res) {
  const { owner_email, shared_with_email } = req.query;
  res.json(await saService.listSharedAccesses({ owner_email, shared_with_email }));
}

export async function create(req, res) {
  const record = await saService.createSharedAccess(req.user.email, req.body.shared_with_email);
  res.status(201).json(record);
}

export async function update(req, res) {
  res.json(await saService.updateSharedAccess(req.params.id, req.user.email, req.body.status));
}

export async function remove(req, res) {
  await saService.deleteSharedAccess(req.params.id, req.user.email);
  res.status(204).end();
}
