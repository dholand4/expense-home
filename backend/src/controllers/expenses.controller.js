import * as expensesService from '../services/expenses.service.js';

export async function list(req, res) {
  res.json(await expensesService.listExpenses(req.user.id, req.user.email));
}

export async function create(req, res) {
  res.status(201).json(await expensesService.createExpense(req.user.id, req.body));
}

export async function update(req, res) {
  res.json(await expensesService.updateExpense(req.params.id, req.user.id, req.body));
}

export async function remove(req, res) {
  await expensesService.deleteExpense(req.params.id, req.user.id);
  res.status(204).end();
}
