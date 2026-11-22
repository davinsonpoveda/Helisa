import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AccountFormValues, CreateAccountInput, FieldErrors } from '../domain/account'
import { AccountsApiError } from '../domain/accounts-api-error'
import { validateAccountForm } from '../domain/validate-account-form'
import type { CreateAccountState } from './hook-contracts'
import { ACCOUNT_TREE_KEY } from './use-account-tree'
import { useAccountsGateway } from './use-accounts-gateway'

/** Valida, envía y reparte los errores: cada uno bajo su campo, o en formError si no tiene. */
export function useCreateAccount(onCreated?: () => void): CreateAccountState {
  const gateway = useAccountsGateway()
  const queryClient = useQueryClient()
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: (input: CreateAccountInput) => gateway.create(input),
  })

  const reset = () => {
    setFieldErrors({})
    setFormError(null)
  }

  const submit = async (values: AccountFormValues): Promise<boolean> => {
    setFormError(null)

    const localErrors = validateAccountForm(values)
    setFieldErrors(localErrors)
    if (Object.keys(localErrors).length > 0) return false

    // La validación recorta los espacios, así que se envía el valor recortado.
    const input: CreateAccountInput = { code: values.code.trim(), name: values.name.trim() }
    if (values.nature !== '') input.nature = values.nature

    try {
      await mutation.mutateAsync(input)
    } catch (error) {
      if (error instanceof AccountsApiError && error.field) {
        setFieldErrors({ [error.field]: error.message })
      } else {
        setFormError(
          error instanceof Error && error.message
            ? error.message
            : 'No se pudo crear la cuenta.',
        )
      }
      return false
    }

    await queryClient.invalidateQueries({ queryKey: ACCOUNT_TREE_KEY })
    reset()
    onCreated?.()
    return true
  }

  return { submit, submitting: mutation.isPending, fieldErrors, formError, reset }
}
