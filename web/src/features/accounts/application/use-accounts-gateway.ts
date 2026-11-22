import { useContext } from 'react'
import type { AccountsGateway } from './accounts-gateway'
import { AccountsGatewayContext } from './accounts-gateway-context'

/** Los hooks de la aplicación obtienen el gateway por aquí, nunca importan HTTP. */
export function useAccountsGateway(): AccountsGateway {
  const gateway = useContext(AccountsGatewayContext)
  if (!gateway) throw new Error('Falta AccountsGatewayProvider')
  return gateway
}
