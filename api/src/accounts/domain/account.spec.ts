import { Account } from './account.js';
import {
  InvalidAccountCodeError,
  InvalidAccountNameError,
  NatureNotAllowedError,
  NatureRequiredError,
} from './errors.js';
import type { Nature } from './nature.js';

describe('Account.create', () => {
  it('crea una clase con su naturaleza (reglas 1 y 8)', () => {
    const account = Account.create('1', 'Activo', 'debit');
    expect(account.code.value).toBe('1');
    expect(account.name).toBe('Activo');
    expect(account.nature).toBe('debit');
  });

  it('crea una cuenta no clase sin naturaleza propia', () => {
    const account = Account.create('110505', 'Caja general');
    expect(account.nature).toBeNull();
  });

  it('guarda el nombre recortado', () => {
    expect(Account.create('11', '  Disponible  ').name).toBe('Disponible');
  });

  it.each(['', '   ', '\t\n'])('rechaza el nombre vacío %j', (name) => {
    expect(() => Account.create('11', name)).toThrow(InvalidAccountNameError);
  });

  it('rechaza un código inválido', () => {
    expect(() => Account.create('12a', 'X')).toThrow(InvalidAccountCodeError);
  });

  it('exige naturaleza en las clases', () => {
    expect(() => Account.create('1', 'Activo')).toThrow(NatureRequiredError);
  });

  it('rechaza una naturaleza fuera de débito/crédito en las clases', () => {
    expect(() => Account.create('1', 'Activo', 'other' as Nature)).toThrow(NatureRequiredError);
  });

  it.each(['11', '1105', '110505'])('prohíbe la naturaleza en %s', (code) => {
    expect(() => Account.create(code, 'X', 'debit')).toThrow(NatureNotAllowedError);
  });
});
