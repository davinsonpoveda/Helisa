export type Nature = 'debit' | 'credit'

/** Regla 2: la longitud del código define el nivel. */
export type Level = 'class' | 'group' | 'account' | 'subaccount'

/** Nodo del árbol anidado que devuelve GET /accounts. */
export interface AccountNode {
  code: string
  name: string
  level: Level
  /** Heredada de la clase (regla 8). */
  nature: Nature
  /** Regla 6: true solo si no tiene hijas. */
  acceptsMovements: boolean
  children: AccountNode[]
}

/** Cuerpo de POST /accounts. */
export interface CreateAccountInput {
  code: string
  name: string
  /** Obligatoria en las clases; la API la rechaza en los demás niveles. */
  nature?: Nature
}

/** Campos del formulario a los que se puede asociar un error. */
export type FormField = 'code' | 'name' | 'nature'

export type FieldErrors = Partial<Record<FormField, string>>

/** Valores tal como los escribe la persona; `nature` vacío = sin elegir. */
export interface AccountFormValues {
  code: string
  name: string
  nature: Nature | ''
}
