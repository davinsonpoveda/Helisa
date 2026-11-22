import type { AccountNode, CreateAccountInput } from '../domain/account'

/**
 * Puerto: lo que la aplicación necesita del backend.
 * Las implementaciones lanzan AccountsApiError cuando la API rechaza la operación.
 */
export interface AccountsGateway {
  getTree(): Promise<AccountNode[]>
  create(input: CreateAccountInput): Promise<AccountNode>
  remove(code: string): Promise<void>
}
