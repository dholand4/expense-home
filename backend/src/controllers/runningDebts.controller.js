import * as rdService from '../services/runningDebts.service.js';

export async function list(req, res) {
  res.json(await rdService.listRunningDebts(req.user.id, req.user.email));
}

export async function create(req, res) {
  res.status(201).json(await rdService.createRunningDebt(req.user.id, req.body));
}

export async function update(req, res) {
  res.json(await rdService.updateRunningDebt(req.params.id, req.user.id, req.body));
}

export async function remove(req, res) {
  await rdService.deleteRunningDebt(req.params.id, req.user.id);
  res.status(204).end();
}
