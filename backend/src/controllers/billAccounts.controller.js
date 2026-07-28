import * as billAccountsService from '../services/billAccounts.service.js';

export async function list(req, res) {
  res.json(await billAccountsService.listBillAccounts(req.user.id, req.user.email));
}

export async function create(req, res) {
  res.status(201).json(await billAccountsService.createBillAccount(req.user.id, req.body));
}

export async function update(req, res) {
  res.json(await billAccountsService.updateBillAccount(req.params.id, req.user.id, req.body));
}

export async function remove(req, res) {
  await billAccountsService.deleteBillAccount(req.params.id, req.user.id);
  res.status(204).end();
}
