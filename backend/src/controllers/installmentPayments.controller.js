import * as ipService from '../services/installmentPayments.service.js';

export async function list(req, res) {
  const { month_key, expense_id } = req.query;
  res.json(await ipService.listInstallmentPayments(req.user.id, req.user.email, { month_key, expense_id }));
}

export async function create(req, res) {
  res.status(201).json(await ipService.createInstallmentPayment(req.user.id, req.body));
}

export async function remove(req, res) {
  await ipService.deleteInstallmentPayment(req.params.id, req.user.id);
  res.status(204).end();
}
