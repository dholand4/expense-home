import * as cardsService from '../services/cards.service.js';

export async function list(req, res) {
  res.json(await cardsService.listCards(req.user.id, req.user.email));
}

export async function create(req, res) {
  res.status(201).json(await cardsService.createCard(req.user.id, req.body));
}

export async function update(req, res) {
  res.json(await cardsService.updateCard(req.params.id, req.user.id, req.body));
}

export async function remove(req, res) {
  await cardsService.deleteCard(req.params.id, req.user.id);
  res.status(204).end();
}
