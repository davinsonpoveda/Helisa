import { apiUrl } from '../../../api'
import type { AccountsGateway } from '../application/accounts-gateway'
import type { AccountNode, CreateAccountInput, FormField } from '../domain/account'
import { AccountsApiError } from '../domain/accounts-api-error'

/** A qué campo del formulario pertenece cada error de la API (null = a ninguno). */
const FIELD_BY_ERROR_KIND: Record<string, FormField> = {
  invalid_account_code: 'code',
  account_already_exists: 'code',
  parent_not_found: 'code',
  invalid_account_name: 'name',
  nature_required: 'nature',
  nature_not_allowed: 'nature',
}

const NETWORK_ERROR_MESSAGE = 'No se pudo conectar con el servidor. Revisa que la API esté corriendo.'

/** Adaptador HTTP del puerto AccountsGateway: traduce errores de la API a AccountsApiError. */
export class HttpAccountsGateway implements AccountsGateway {
  async getTree(): Promise<AccountNode[]> {
    const response = await this.send('/accounts')
    return (await response.json()) as AccountNode[]
  }

  async create(input: CreateAccountInput): Promise<AccountNode> {
    const response = await this.send('/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    return (await response.json()) as AccountNode
  }

  async remove(code: string): Promise<void> {
    await this.send(`/accounts/${encodeURIComponent(code)}`, { method: 'DELETE' })
  }

  private async send(path: string, init?: RequestInit): Promise<Response> {
    let response: Response
    try {
      response = await fetch(apiUrl(path), init)
    } catch {
      throw new AccountsApiError(NETWORK_ERROR_MESSAGE, 'network_error', 0, null)
    }
    if (!response.ok) throw await this.toApiError(response)
    return response
  }

  private async toApiError(response: Response): Promise<AccountsApiError> {
    try {
      const body = (await response.json()) as { error?: unknown; message?: unknown }
      const kind = typeof body.error === 'string' ? body.error : 'unknown_error'
      const message =
        typeof body.message === 'string' ? body.message : `Error inesperado del servidor (${response.status}).`
      return new AccountsApiError(message, kind, response.status, FIELD_BY_ERROR_KIND[kind] ?? null)
    } catch {
      return new AccountsApiError(
        `Error inesperado del servidor (${response.status}).`,
        'unknown_error',
        response.status,
        null,
      )
    }
  }
}
