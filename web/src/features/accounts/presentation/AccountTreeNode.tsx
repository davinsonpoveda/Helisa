import { Badge, Button, Group, Text, UnstyledButton } from '@mantine/core'
import type { AccountNode } from '../domain/account'

interface AccountTreeNodeProps {
  node: AccountNode
  depth: number
  expanded: ReadonlySet<string>
  onToggle: (code: string) => void
  onDelete: (node: AccountNode) => void
}

const NATURE_LABEL = { debit: 'Débito', credit: 'Crédito' } as const

/** Fila recursiva del árbol: expandir/colapsar, etiquetas y botón Eliminar. */
export function AccountTreeNode({ node, depth, expanded, onToggle, onDelete }: AccountTreeNodeProps) {
  const hasChildren = node.children.length > 0
  const isExpanded = expanded.has(node.code)

  return (
    <li role="treeitem" aria-expanded={hasChildren ? isExpanded : undefined} style={{ listStyle: 'none' }}>
      <Group gap="xs" wrap="nowrap" py={4} style={{ paddingLeft: depth * 20 }}>
        {hasChildren ? (
          <UnstyledButton
            onClick={() => onToggle(node.code)}
            aria-label={`${isExpanded ? 'Colapsar' : 'Expandir'} ${node.code}`}
            style={{ width: 20, textAlign: 'center' }}
          >
            {isExpanded ? '▾' : '▸'}
          </UnstyledButton>
        ) : (
          <span style={{ width: 20 }} aria-hidden="true" />
        )}
        <Text ff="monospace" fw={600}>
          {node.code}
        </Text>
        <Text style={{ flex: 1 }}>{node.name}</Text>
        <Badge color={node.nature === 'debit' ? 'blue' : 'grape'} variant="light">
          {NATURE_LABEL[node.nature]}
        </Badge>
        {node.acceptsMovements && (
          <Badge color="green" variant="light">
            Admite movimientos
          </Badge>
        )}
        <Button size="compact-xs" color="red" variant="subtle" onClick={() => onDelete(node)}>
          Eliminar
        </Button>
      </Group>
      {hasChildren && isExpanded && (
        <ul role="group" style={{ margin: 0, padding: 0 }}>
          {node.children.map((child) => (
            <AccountTreeNode
              key={child.code}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </li>
  )
}
