import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@mantine/core/styles.css'
import './index.css'
import App from './App.tsx'
import { AccountsGatewayProvider } from './features/accounts/application/accounts-gateway-provider.tsx'
import { HttpAccountsGateway } from './features/accounts/infrastructure/http-accounts-gateway.ts'

// Composition root del front: aquí se decide qué implementación del puerto se usa.
const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
const gateway = new HttpAccountsGateway()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider>
      <QueryClientProvider client={queryClient}>
        <AccountsGatewayProvider gateway={gateway}>
          <App />
        </AccountsGatewayProvider>
      </QueryClientProvider>
    </MantineProvider>
  </StrictMode>,
)
