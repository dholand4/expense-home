import * as cipService from '../services/cardInvoicePayments.service.js';

export async function list(req, res) {
  const { card_id, month_key } = req.query;
  res.json(await cipService.listCardInvoicePayments(req.user.id, req.user.email, { card_id, month_key }));
}

export async function create(req, res) {
  res.status(201).json(await cipService.createCardInvoicePayment(req.user.id, req.body));
}

export async function update(req, res) {
  res.json(await cipService.updateCardInvoicePayment(req.params.id, req.user.id, req.body));
}

export async function remove(req, res) {
  await cipService.deleteCardInvoicePayment(req.params.id, req.user.id);
  res.status(204).end();
}
