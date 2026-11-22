import { describe, it, expect } from 'vitest'
import type { AccountFormValues } from './account'
import { validateAccountForm } from './validate-account-form'

const form = (overrides: Partial<AccountFormValues>): AccountFormValues => ({
  code: '',
  name: 'Caja',
  nature: '',
  ...overrides,
})

describe('validateAccountForm', () => {
  describe('casos válidos', () => {
    it.each([
      ['1', 'debit'],
      ['3', 'credit'],
    ] as const)('clase %s con naturaleza', (code, nature) => {
      expect(validateAccountForm(form({ code, nature }))).toEqual({})
    })

    it.each(['11', '1105', '110505'])('código %s sin naturaleza', (code) => {
      expect(validateAccountForm(form({ code }))).toEqual({})
    })

    it('ignora espacios alrededor del código y del nombre', () => {
      expect(validateAccountForm(form({ code: ' 1105 ', name: '  Caja  ' }))).toEqual({})
    })
  })

  describe('código inválido', () => {
    it.each(['', '   ', 'abc', '12a', '123', '12345', '1234567', '0', '01', '-11'])(
      'rechaza "%s"',
      (code) => {
        const errors = validateAccountForm(form({ code }))
        expect(errors.code).toBeTruthy()
      },
    )

    it('no valida la naturaleza si el código es inválido', () => {
      const errors = validateAccountForm(form({ code: '123', nature: 'debit' }))
      expect(errors.code).toBeTruthy()
      expect(errors.nature).toBeUndefined()
    })
  })

  describe('nombre', () => {
    it.each(['', '   '])('rechaza nombre "%s"', (name) => {
      const errors = validateAccountForm(form({ code: '11', name }))
      expect(errors.name).toBeTruthy()
    })
  })

  describe('naturaleza (regla 8)', () => {
    it('es obligatoria en una clase', () => {
      const errors = validateAccountForm(form({ code: '1', nature: '' }))
      expect(errors.nature).toBe('La naturaleza es obligatoria en las clases.')
    })

    it.each(['11', '1105', '110505'])('se rechaza en %s', (code) => {
      const errors = validateAccountForm(form({ code, nature: 'credit' }))
      expect(errors.nature).toBe('La naturaleza solo se define en las clases.')
    })
  })

  it('acumula errores de varios campos', () => {
    const errors = validateAccountForm(form({ code: 'abc', name: '' }))
    expect(Object.keys(errors).sort()).toEqual(['code', 'name'])
  })
})
