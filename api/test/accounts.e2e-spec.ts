import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AccountsModule } from './../src/accounts/infrastructure/accounts.module.js';

interface Node {
  code: string;
  name: string;
  level: string;
  nature: string;
  acceptsMovements: boolean;
  children: Node[];
}

describe('Catálogo de cuentas (e2e)', () => {
  let app: INestApplication<App>;
  const http = () => request(app.getHttpServer());

  // Cada prueba arranca con un módulo nuevo, es decir, con la semilla intacta.
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AccountsModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  const find = (nodes: Node[], code: string): Node | undefined => {
    for (const node of nodes) {
      if (node.code === code) return node;
      const found = find(node.children, code);
      if (found) return found;
    }
    return undefined;
  };

  describe('POST /accounts', () => {
    it('crea una cuenta cuyo padre existe (201)', async () => {
      const res = await http().post('/accounts').send({ code: '110515', name: 'Caja auxiliar' }).expect(201);
      expect(res.body).toMatchObject({ code: '110515', name: 'Caja auxiliar', level: 'subaccount', nature: 'debit' });
    });

    it('crea una clase con su naturaleza (201)', async () => {
      const res = await http().post('/accounts').send({ code: '3', name: 'Patrimonio', nature: 'credit' }).expect(201);
      expect(res.body).toMatchObject({ code: '3', level: 'class', nature: 'credit' });
    });

    it('rechaza un código no numérico (400)', async () => {
      const res = await http().post('/accounts').send({ code: '11A5', name: 'X' }).expect(400);
      expect(res.body.error).toBe('invalid_account_code');
    });

    it('rechaza una longitud inválida (400)', async () => {
      const res = await http().post('/accounts').send({ code: '111', name: 'X' }).expect(400);
      expect(res.body.error).toBe('invalid_account_code');
    });

    it('rechaza un código duplicado (409)', async () => {
      const res = await http().post('/accounts').send({ code: '1105', name: 'Otra caja' }).expect(409);
      expect(res.body.error).toBe('account_already_exists');
    });

    it('rechaza una cuenta sin padre (422)', async () => {
      const res = await http().post('/accounts').send({ code: '1299', name: 'Huérfana' }).expect(422);
      expect(res.body.error).toBe('parent_not_found');
    });

    it('rechaza una clase sin naturaleza (400)', async () => {
      const res = await http().post('/accounts').send({ code: '3', name: 'Patrimonio' }).expect(400);
      expect(res.body.error).toBe('nature_required');
    });

    it('rechaza naturaleza en un nivel que no es clase (400)', async () => {
      const res = await http().post('/accounts').send({ code: '12', name: 'Inversiones', nature: 'debit' }).expect(400);
      expect(res.body.error).toBe('nature_not_allowed');
    });

    it('rechaza un body con forma incorrecta (400)', async () => {
      await http().post('/accounts').send({ code: 1105, name: 'X' }).expect(400);
    });
  });

  describe('GET /accounts', () => {
    it('devuelve el árbol anidado con la semilla', async () => {
      const res = await http().get('/accounts').expect(200);
      const tree = res.body as Node[];
      expect(tree.map((n) => n.code)).toEqual(['1', '2']);
      expect(find(tree, '1')!.children.map((n) => n.code)).toEqual(['11']);
      expect(find(tree, '1105')!.children.map((n) => n.code)).toEqual(['110505', '110510']);
    });

    it('hereda la naturaleza de la clase', async () => {
      const tree = (await http().get('/accounts').expect(200)).body as Node[];
      expect(find(tree, '110505')!.nature).toBe('debit');
      expect(find(tree, '2105')!.nature).toBe('credit');
    });

    it('solo las hojas admiten movimientos', async () => {
      const tree = (await http().get('/accounts').expect(200)).body as Node[];
      expect(find(tree, '110505')!.acceptsMovements).toBe(true);
      expect(find(tree, '1105')!.acceptsMovements).toBe(false);
    });

    it('una cuenta recién creada aparece bajo su padre', async () => {
      await http().post('/accounts').send({ code: '2106', name: 'Bancos extranjeros' }).expect(201);
      const tree = (await http().get('/accounts').expect(200)).body as Node[];
      expect(find(tree, '21')!.children.map((n) => n.code)).toEqual(['2105', '2106']);
    });
  });

  describe('DELETE /accounts/:code', () => {
    it('rechaza eliminar una cuenta con hijas (409)', async () => {
      const res = await http().delete('/accounts/1105').expect(409);
      expect(res.body.error).toBe('account_has_children');
    });

    it('elimina una cuenta sin hijas (204)', async () => {
      await http().delete('/accounts/110510').expect(204);
      const tree = (await http().get('/accounts').expect(200)).body as Node[];
      expect(find(tree, '110510')).toBeUndefined();
    });

    it('responde 404 si la cuenta no existe', async () => {
      const res = await http().delete('/accounts/9999').expect(404);
      expect(res.body.error).toBe('account_not_found');
    });

    it('al borrar la última hija, el padre vuelve a admitir movimientos', async () => {
      await http().delete('/accounts/110505').expect(204);
      await http().delete('/accounts/110510').expect(204);
      const tree = (await http().get('/accounts').expect(200)).body as Node[];
      expect(find(tree, '1105')!.acceptsMovements).toBe(true);
    });
  });
});
