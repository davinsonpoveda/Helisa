import type { AccountFormValues, FieldErrors } from './account'

const VALID_LENGTHS = [1, 2, 4, 6]

/** Devuelve el mensaje de error del código, o null si el formato es válido. */
function codeError(code: string): string | null {
  if (code === '') return 'El código es obligatorio.'
  if (!/^\d+$/.test(code)) return 'El código solo puede tener dígitos.'
  if (!VALID_LENGTHS.includes(code.length)) {
    return 'El código debe tener 1, 2, 4 o 6 dígitos.'
  }
  if (code.startsWith('0')) return 'El código no puede empezar en 0.'
  return null
}

/**
 * Validación previa al envío (reglas 1, 2 y 8). Devuelve un objeto vacío si todo está bien.
 * La existencia del padre y la unicidad del código las decide la API, no esta función.
 */
export function validateAccountForm(values: AccountFormValues): FieldErrors {
  const errors: FieldErrors = {}
  const code = values.code.trim()

  const formatError = codeError(code)
  if (formatError) errors.code = formatError

  if (values.name.trim() === '') errors.name = 'El nombre es obligatorio.'

  // La naturaleza solo se valida si el código es válido: de él depende si es clase.
  if (!formatError) {
    const isClass = code.length === 1
    if (isClass && values.nature === '') {
      errors.nature = 'La naturaleza es obligatoria en las clases.'
    } else if (!isClass && values.nature !== '') {
      errors.nature = 'La naturaleza solo se define en las clases.'
    }
  }

  return errors
}
