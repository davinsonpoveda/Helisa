import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { DeleteAccountState } from './hook-contracts'
import { ACCOUNT_TREE_KEY } from './use-account-tree'
import { useAccountsGateway } from './use-accounts-gateway'

/** Elimina una cuenta y expone el error de la cuenta afectada (p. ej. tiene hijas). */
export function useDeleteAccount(onDeleted?: () => void): DeleteAccountState {
  const gateway = useAccountsGateway()
  const queryClient = useQueryClient()
  const [error, setError] = useState<DeleteAccountState['error']>(null)

  const mutation = useMutation({
    mutationFn: (code: string) => gateway.remove(code),
  })

  const remove = async (code: string): Promise<void> => {
    setError(null)
    try {
      await mutation.mutateAsync(code)
    } catch (caught) {
      setError({
        code,
        message:
          caught instanceof Error && caught.message
            ? caught.message
            : 'No se pudo eliminar la cuenta.',
      })
      return
    }
    await queryClient.invalidateQueries({ queryKey: ACCOUNT_TREE_KEY })
    onDeleted?.()
  }

  return {
    remove,
    deletingCode: mutation.isPending ? (mutation.variables ?? null) : null,
    error,
    clearError: () => setError(null),
  }
}
