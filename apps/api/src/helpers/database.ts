/**
 * Détecte une violation de contrainte d'unicité PostgreSQL (SQLSTATE `23505`), par exemple un email déjà utilisé.
 */
export function isUniqueViolation(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  return (error as { code?: string }).code === '23505';
}

/**
 * Détecte une violation de contrainte de clé étrangère PostgreSQL (SQLSTATE `23503`), par exemple la suppression
 * d'un enregistrement encore référencé par une autre table.
 */
export function isForeignKeyViolation(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  return (error as { code?: string }).code === '23503';
}
