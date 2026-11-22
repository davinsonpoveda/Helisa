import { Button, Group, Modal, Text } from '@mantine/core'
import type { AccountNode } from '../domain/account'

interface ConfirmDeleteModalProps {
  /** Cuenta a eliminar; null = modal cerrado. */
  account: AccountNode | null
  loading: boolean
  onCancel: () => void
  onConfirm: (account: AccountNode) => void
}

/** Confirmación previa a eliminar. La API decide si la operación es válida (regla 5). */
export function ConfirmDeleteModal({ account, loading, onCancel, onConfirm }: ConfirmDeleteModalProps) {
  return (
    <Modal opened={account !== null} onClose={onCancel} title="Eliminar cuenta" centered>
      {account && (
        <>
          <Text>
            ¿Eliminar la cuenta {account.code} · {account.name}?
          </Text>
          <Text size="sm" c="dimmed" mt="xs">
            Esta acción no se puede deshacer.
          </Text>
          <Group justify="flex-end" mt="lg">
            <Button variant="default" onClick={onCancel} disabled={loading}>
              Cancelar
            </Button>
            <Button color="red" loading={loading} onClick={() => onConfirm(account)}>
              Eliminar
            </Button>
          </Group>
        </>
      )}
    </Modal>
  )
}
