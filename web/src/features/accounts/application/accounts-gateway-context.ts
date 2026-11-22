import { createContext } from 'react'
import type { AccountsGateway } from './accounts-gateway'

export const AccountsGatewayContext = createContext<AccountsGateway | null>(null)
