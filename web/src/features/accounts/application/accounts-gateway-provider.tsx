import type { ReactNode } from 'react'
import type { AccountsGateway } from './accounts-gateway'
import { AccountsGatewayContext } from './accounts-gateway-context'

/** Inyección de dependencias: quien arma la app decide qué implementación usar. */
export function AccountsGatewayProvider(props: { gateway: AccountsGateway; children: ReactNode }) {
  return (
    <AccountsGatewayContext.Provider value={props.gateway}>
      {props.children}
    </AccountsGatewayContext.Provider>
  )
}
