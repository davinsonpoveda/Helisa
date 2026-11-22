import { useQuery } from '@tanstack/react-query'
import type { AccountTreeState } from './hook-contracts'
import { useAccountsGateway } from './use-accounts-gateway'

export const ACCOUNT_TREE_KEY = ['accounts', 'tree'] as const

/** Carga del catálogo como árbol: loading, error (con reintento) y ready. */
export function useAccountTree(): AccountTreeState {
  const gateway = useAccountsGateway()
  const query = useQuery({
    queryKey: ACCOUNT_TREE_KEY,
    queryFn: () => gateway.getTree(),
  })

  const status =
    query.status === 'pending' ? 'loading' : query.status === 'error' ? 'error' : 'ready'

  return {
    status,
    nodes: query.data ?? [],
    error:
      query.status === 'error'
        ? query.error?.message || 'No se pudo cargar el catálogo.'
        : null,
    reload: () => {
      void query.refetch()
    },
  }
}
