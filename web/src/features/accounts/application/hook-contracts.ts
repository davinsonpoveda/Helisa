import type { AccountFormValues, AccountNode, FieldErrors } from '../domain/account'

/** useAccountTree(): carga del catálogo. */
export interface AccountTreeState {
  status: 'loading' | 'error' | 'ready'
  nodes: AccountNode[]
  /** Mensaje legible cuando status === 'error'. */
  error: string | null
  reload: () => void
}

/** useCreateAccount(onCreated?): valida, envía y reparte los errores por campo. */
export interface CreateAccountState {
  /** Devuelve true si se creó. No llama a la API si la validación falla. */
  submit: (values: AccountFormValues) => Promise<boolean>
  submitting: boolean
  /** Errores de validación local y de la API, cada uno bajo su campo. */
  fieldErrors: FieldErrors
  /** Error que no pertenece a ningún campo (red, error inesperado). */
  formError: string | null
  reset: () => void
}

/** useDeleteAccount(onDeleted?): elimina y expone el error de la cuenta afectada. */
export interface DeleteAccountState {
  remove: (code: string) => Promise<void>
  /** Código de la cuenta que se está eliminando, o null. */
  deletingCode: string | null
  /** Error de la última eliminación fallida (p. ej. la cuenta tiene hijas). */
  error: { code: string; message: string } | null
  clearError: () => void
}
