import type { Level } from '../domain/level.js';
import type { Nature } from '../domain/nature.js';

export interface CreateAccountInput {
  code: string;
  name: string;
  /** Obligatoria en las clases (regla 8); prohibida en los demás niveles. */
  nature?: Nature;
}

/** Nodo del árbol anidado que devuelve la consulta del catálogo. */
export interface AccountNode {
  code: string;
  name: string;
  level: Level;
  /** Heredada de la clase. */
  nature: Nature;
  /** Regla 6: true solo si no tiene hijas. */
  acceptsMovements: boolean;
  children: AccountNode[];
}
