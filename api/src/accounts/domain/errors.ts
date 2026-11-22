/** Base de los errores de negocio. La capa HTTP los traduce a códigos de estado. */
export abstract class DomainError extends Error {
  abstract readonly kind: string;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvalidAccountCodeError extends DomainError {
  readonly kind = 'invalid_account_code';
}

export class InvalidAccountNameError extends DomainError {
  readonly kind = 'invalid_account_name';
}

export class NatureRequiredError extends DomainError {
  readonly kind = 'nature_required';
}

export class NatureNotAllowedError extends DomainError {
  readonly kind = 'nature_not_allowed';
}

export class AccountAlreadyExistsError extends DomainError {
  readonly kind = 'account_already_exists';
}

export class ParentNotFoundError extends DomainError {
  readonly kind = 'parent_not_found';
}

export class AccountNotFoundError extends DomainError {
  readonly kind = 'account_not_found';
}

export class AccountHasChildrenError extends DomainError {
  readonly kind = 'account_has_children';
}
