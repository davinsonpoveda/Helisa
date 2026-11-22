import type { FormField } from './account'

/**
 * Error de la API ya traducido. `field` indica junto a qué campo del formulario
 * debe mostrarse; es null cuando no pertenece a ninguno (p. ej. eliminar con hijas
 * o un fallo de red).
 */
export class AccountsApiError extends Error {
  readonly kind: string
  readonly status: number
  readonly field: FormField | null

  constructor(message: string, kind: string, status: number, field: FormField | null) {
    super(message)
    this.name = 'AccountsApiError'
    this.kind = kind
    this.status = status
    this.field = field
  }
}
