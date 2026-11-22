import type { AccountsGateway } from '../application/accounts-gateway'
import type { AccountNode, CreateAccountInput } from '../domain/account'

/**
 * Adaptador HTTP del puerto AccountsGateway.
 * CONTRATO: implementación en la tarea 2. Debe traducir los errores de la API
 * ({ statusCode, error, message }) a AccountsApiError con su campo:
 *   invalid_account_code | account_already_exists | parent_not_found -> 'code'
 *   invalid_account_name -> 'name'
 *   nature_required | nature_not_allowed -> 'nature'
 *   cualquier otro (y fallos de red, kind 'network_error', status 0) -> null
 */
export class HttpAccountsGateway implements AccountsGateway {
  getTree(): Promise<AccountNode[]> {
    throw new Error('Pendiente: tarea 2 (gateway)')
  }

  create(_input: CreateAccountInput): Promise<AccountNode> {
    throw new Error('Pendiente: tarea 2 (gateway)')
  }

  remove(_code: string): Promise<void> {
    throw new Error('Pendiente: tarea 2 (gateway)')
  }
}
