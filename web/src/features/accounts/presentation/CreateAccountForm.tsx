import { useState } from 'react'
import { Alert, Button, Select, Stack, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useCreateAccount } from '../application/use-create-account'
import type { AccountFormValues, FormField, Nature } from '../domain/account'
import { validateAccountForm } from '../domain/validate-account-form'

const NATURE_OPTIONS = [
  { value: 'debit', label: 'Débito' },
  { value: 'credit', label: 'Crédito' },
]

/**
 * Formulario de creación. Valida antes de enviar (dominio) y muestra cada error,
 * tanto el local como el que devuelve la API, junto al campo que corresponde.
 */
export function CreateAccountForm() {
  const [created, setCreated] = useState(false)
  // Campos editados desde el último envío: su error de API ya no aplica.
  const [edited, setEdited] = useState<Partial<Record<FormField, boolean>>>({})

  const { submit, submitting, fieldErrors, formError, reset } = useCreateAccount()

  const form = useForm<AccountFormValues>({
    initialValues: { code: '', name: '', nature: '' },
    validate: (values) => validateAccountForm(values),
  })

  const errorOf = (field: FormField) =>
    form.errors[field] ?? (edited[field] ? undefined : fieldErrors[field])

  const touch = (field: FormField) => {
    setCreated(false)
    setEdited((previous) => ({ ...previous, [field]: true }))
    form.clearFieldError(field)
  }

  const handleSubmit = form.onSubmit(async (values) => {
    setCreated(false)
    setEdited({})
    const ok = await submit(values)
    if (ok) {
      form.reset()
      reset()
      setCreated(true)
    }
  })

  const isClass = form.values.code.length === 1

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Stack gap="sm">
        <TextInput
          label="Código"
          description="1, 2, 4 o 6 dígitos. El padre es el prefijo del nivel anterior."
          placeholder="Ej.: 110505"
          inputMode="numeric"
          value={form.values.code}
          error={errorOf('code')}
          onChange={(event) => {
            const code = event.currentTarget.value
            form.setFieldValue('code', code)
            if (code.length !== 1) form.setFieldValue('nature', '')
            touch('code')
          }}
        />

        <TextInput
          label="Nombre"
          placeholder="Ej.: Caja general"
          value={form.values.name}
          error={errorOf('name')}
          onChange={(event) => {
            form.setFieldValue('name', event.currentTarget.value)
            touch('name')
          }}
        />

        {isClass && (
          <Select
            label="Naturaleza"
            description="Solo las clases tienen naturaleza"
            placeholder="Elige débito o crédito"
            data={NATURE_OPTIONS}
            value={form.values.nature || null}
            error={errorOf('nature')}
            onChange={(value) => {
              form.setFieldValue('nature', (value as Nature | null) ?? '')
              touch('nature')
            }}
          />
        )}

        {formError && (
          <Alert color="red" title="No se pudo crear la cuenta">
            {formError}
          </Alert>
        )}

        {created && (
          <Alert color="green" title="Cuenta creada">
            La cuenta ya aparece en el catálogo.
          </Alert>
        )}

        <Button type="submit" loading={submitting}>
          Crear cuenta
        </Button>
      </Stack>
    </form>
  )
}
