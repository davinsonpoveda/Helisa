import { afterEach, describe, expect, it, vi } from 'vitest'
import { AccountsApiError } from '../domain/accounts-api-error'
import { HttpAccountsGateway } from './http-accounts-gateway'

function stubFetch(response: Response | Error) {
  const fetchMock = vi.fn(() =>
    response instanceof Error ? Promise.reject(response) : Promise.resolve(response),
  )
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

async function catchError(promise: Promise<unknown>): Promise<AccountsApiError> {
  try {
    await promise
  } catch (error) {
    return error as AccountsApiError
  }
  throw new Error('Se esperaba un error')
}

describe('HttpAccountsGateway', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('getTree devuelve el árbol', async () => {
    const tree = [{ code: '1', name: 'Activo', children: [] }]
    const fetchMock = stubFetch(json(tree, 200))

    await expect(new HttpAccountsGateway().getTree()).resolves.toEqual(tree)
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/accounts'), undefined)
  })

  it('create envía el JSON por POST y devuelve el nodo', async () => {
    const node = { code: '110515', name: 'Caja', children: [] }
    const fetchMock = stubFetch(json(node, 201))

    await expect(new HttpAccountsGateway().create({ code: '110515', name: 'Caja' })).resolves.toEqual(node)
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(init.method).toBe('POST')
    expect(init.body).toBe(JSON.stringify({ code: '110515', name: 'Caja' }))
  })

  it('422 parent_not_found se asocia al campo code', async () => {
    stubFetch(json({ statusCode: 422, error: 'parent_not_found', message: 'El padre 9905 no existe.' }, 422))

    const error = await catchError(new HttpAccountsGateway().create({ code: '990505', name: 'X' }))

    expect(error).toBeInstanceOf(AccountsApiError)
    expect(error.kind).toBe('parent_not_found')
    expect(error.status).toBe(422)
    expect(error.field).toBe('code')
    expect(error.message).toBe('El padre 9905 no existe.')
  })

  it('400 invalid_account_name se asocia al campo name', async () => {
    stubFetch(json({ statusCode: 400, error: 'invalid_account_name', message: 'Nombre vacío.' }, 400))

    const error = await catchError(new HttpAccountsGateway().create({ code: '1', name: ' ' }))

    expect(error.field).toBe('name')
  })

  it('400 nature_required se asocia al campo nature', async () => {
    stubFetch(json({ statusCode: 400, error: 'nature_required', message: 'Falta la naturaleza.' }, 400))

    const error = await catchError(new HttpAccountsGateway().create({ code: '1', name: 'Activo' }))

    expect(error.field).toBe('nature')
  })

  it('409 account_has_children no pertenece a ningún campo', async () => {
    stubFetch(json({ statusCode: 409, error: 'account_has_children', message: 'Tiene hijas.' }, 409))

    const error = await catchError(new HttpAccountsGateway().remove('11'))

    expect(error.kind).toBe('account_has_children')
    expect(error.status).toBe(409)
    expect(error.field).toBeNull()
  })

  it('un cuerpo que no es JSON da un mensaje genérico con el status', async () => {
    stubFetch(new Response('<html>Bad gateway</html>', { status: 502 }))

    const error = await catchError(new HttpAccountsGateway().getTree())

    expect(error.status).toBe(502)
    expect(error.field).toBeNull()
    expect(error.message).toContain('502')
  })

  it('un fallo de red se traduce a network_error', async () => {
    stubFetch(new TypeError('Failed to fetch'))

    const error = await catchError(new HttpAccountsGateway().getTree())

    expect(error.kind).toBe('network_error')
    expect(error.status).toBe(0)
    expect(error.field).toBeNull()
    expect(error.message).toContain('No se pudo conectar')
  })

  it('remove acepta un 204 sin cuerpo y codifica el código', async () => {
    const fetchMock = stubFetch(new Response(null, { status: 204 }))

    await expect(new HttpAccountsGateway().remove('110505')).resolves.toBeUndefined()
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toContain('/accounts/110505')
    expect(init.method).toBe('DELETE')
  })
})
