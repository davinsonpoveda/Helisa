import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import type { Response } from 'express';
import { DomainError } from '../../domain/errors.js';

const STATUS_BY_KIND: Record<string, number> = {
  invalid_account_code: 400,
  invalid_account_name: 400,
  nature_required: 400,
  nature_not_allowed: 400,
  account_already_exists: 409,
  account_has_children: 409,
  parent_not_found: 422,
  account_not_found: 404,
};

/** Único lugar que conoce la correspondencia error de dominio -> código HTTP. */
@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter<DomainError> {
  catch(error: DomainError, host: ArgumentsHost): void {
    const statusCode = STATUS_BY_KIND[error.kind] ?? 500;
    host
      .switchToHttp()
      .getResponse<Response>()
      .status(statusCode)
      .json({ statusCode, error: error.kind, message: error.message });
  }
}
