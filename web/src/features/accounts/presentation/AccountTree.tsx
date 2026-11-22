import { useState } from 'react'
import { Alert, Button, Group, Loader, Stack, Text } from '@mantine/core'
import { useAccountTree } from '../application/use-account-tree'
import { useDeleteAccount } from '../application/use-delete-account'
import type { AccountNode } from '../domain/account'
import { AccountTreeNode } from './AccountTreeNode'
import { ConfirmDeleteModal } from './ConfirmDeleteModal'

function collectExpandable(nodes: AccountNode[]): string[] {
  return nodes.flatMap((node) =>
    node.children.length > 0 ? [node.code, ...collectExpandable(node.children)] : [],
  )
}

/** Catálogo como árbol: carga, error, expandir/colapsar y eliminación con confirmación. */
export function AccountTree() {
  const tree = useAccountTree()
  const deletion = useDeleteAccount(tree.reload)
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set())
  const [pending, setPending] = useState<AccountNode | null>(null)

  const toggle = (code: string) =>
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(code)) next.delete(code)
      else next.add(code)
      return next
    })

  const confirmDelete = async (account: AccountNode) => {
    await deletion.remove(account.code)
    setPending(null)
  }

  if (tree.status === 'loading') {
    return (
      <Group gap="sm" role="status">
        <Loader size="sm" />
        <Text>Cargando catálogo…</Text>
      </Group>
    )
  }

  if (tree.status === 'error') {
    return (
      <Alert color="red" title="No se pudo cargar el catálogo">
        <Stack gap="xs" align="flex-start">
          <Text size="sm">{tree.error ?? 'Ocurrió un error inesperado.'}</Text>
          <Button size="xs" color="red" variant="light" onClick={tree.reload}>
            Reintentar
          </Button>
        </Stack>
      </Alert>
    )
  }

  return (
    <Stack gap="sm">
      {deletion.error && (
        <Alert color="red" title="No se pudo eliminar" withCloseButton onClose={deletion.clearError}>
          No se pudo eliminar {deletion.error.code}: {deletion.error.message}
        </Alert>
      )}

      {tree.nodes.length === 0 ? (
        <Text c="dimmed">Todavía no hay cuentas</Text>
      ) : (
        <>
          <Group gap="xs">
            <Button size="compact-sm" variant="default" onClick={() => setExpanded(new Set(collectExpandable(tree.nodes)))}>
              Expandir todo
            </Button>
            <Button size="compact-sm" variant="default" onClick={() => setExpanded(new Set())}>
              Colapsar todo
            </Button>
          </Group>
          <ul role="tree" style={{ margin: 0, padding: 0 }}>
            {tree.nodes.map((node) => (
              <AccountTreeNode
                key={node.code}
                node={node}
                depth={0}
                expanded={expanded}
                onToggle={toggle}
                onDelete={setPending}
              />
            ))}
          </ul>
        </>
      )}

      <ConfirmDeleteModal
        account={pending}
        loading={pending !== null && deletion.deletingCode === pending.code}
        onCancel={() => setPending(null)}
        onConfirm={confirmDelete}
      />
    </Stack>
  )
}
