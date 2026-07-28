export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class BadRequestError extends AppError {
  constructor(msg = 'Requisição inválida.') { super(msg, 400); }
}
export class UnauthorizedError extends AppError {
  constructor(msg = 'Não autorizado.') { super(msg, 401); }
}
export class ForbiddenError extends AppError {
  constructor(msg = 'Acesso negado.') { super(msg, 403); }
}
export class NotFoundError extends AppError {
  constructor(msg = 'Não encontrado.') { super(msg, 404); }
}
export class ConflictError extends AppError {
  constructor(msg = 'Conflito de dados.') { super(msg, 409); }
}
