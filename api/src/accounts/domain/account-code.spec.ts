import { AccountCode } from './account-code.js';
import { InvalidAccountCodeError } from './errors.js';

describe('AccountCode', () => {
  describe('parse (reglas 1 y 2)', () => {
    it.each(['1', '3', '9', '11', '21', '1105', '2105', '110505'])(
      'acepta el código válido %s',
      (raw) => {
        expect(AccountCode.parse(raw).value).toBe(raw);
      },
    );

    it.each([
      '',
      'abc',
      '12a',
      '1 1',
      ' 11',
      '11 ',
      '1.5',
      '-1',
      '123',
      '12345',
      '1234567',
      '0',
      '01',
      '0105',
    ])('rechaza el código inválido "%s"', (raw) => {
      expect(() => AccountCode.parse(raw)).toThrow(InvalidAccountCodeError);
    });
  });

  describe('level (regla 2)', () => {
    it.each([
      ['1', 'class'],
      ['11', 'group'],
      ['1105', 'account'],
      ['110505', 'subaccount'],
    ] as const)('%s es %s', (raw, level) => {
      expect(AccountCode.parse(raw).level).toBe(level);
    });
  });

  describe('parentCode (regla 3)', () => {
    it('recorre la cadena 110505 -> 1105 -> 11 -> 1 -> null', () => {
      const chain: string[] = [];
      let current: string | null = '110505';
      while (current !== null) {
        chain.push(current);
        current = AccountCode.parse(current).parentCode;
      }
      expect(chain).toEqual(['110505', '1105', '11', '1']);
      expect(AccountCode.parse('1').parentCode).toBeNull();
    });
  });

  describe('classCode (regla 8)', () => {
    it('es el primer dígito', () => {
      expect(AccountCode.parse('110505').classCode).toBe('1');
      expect(AccountCode.parse('2105').classCode).toBe('2');
      expect(AccountCode.parse('2').classCode).toBe('2');
    });
  });
});
