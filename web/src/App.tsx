import { Container, Grid, Paper, Title } from '@mantine/core'
import { AccountTree } from './features/accounts/presentation/AccountTree'
import { CreateAccountForm } from './features/accounts/presentation/CreateAccountForm'

function App() {
  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="lg">
        Catálogo de cuentas
      </Title>

      <Grid gap="lg">
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Paper withBorder p="md" radius="md">
            <Title order={3} mb="sm">
              Cuentas
            </Title>
            <AccountTree />
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 5 }}>
          <Paper withBorder p="md" radius="md">
            <Title order={3} mb="sm">
              Nueva cuenta
            </Title>
            <CreateAccountForm />
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  )
}

export default App
