import type { AccountFormValues, FieldErrors } from './account'

/**
 * Validación previa al envío (reglas 1, 2 y 8). Devuelve un objeto vacío si todo está bien.
 * CONTRATO: la implementación real es la tarea 1; por ahora solo fija la firma.
 * La existencia del padre y la unicidad del código las decide la API, no esta función.
 */
export function validateAccountForm(_values: AccountFormValues): FieldErrors {
  throw new Error('Pendiente: tarea 1 (validación)')
}
