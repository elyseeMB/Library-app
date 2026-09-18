import type { Insertable, Selectable, SelectQueryBuilder, Updateable } from 'kysely';
import { BaseRepository } from '#repositories/base_repository';
import type { DB } from '#types/db';

export type Book = Selectable<DB['books']>;
export type NewBook = Insertable<DB['books']>;
export type BookUpdate = Updateable<DB['books']>;
export type BookWithAuthor = Book & { author_name: string };

export interface Paginated<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetPaginatedParams {
  page?: number;
  limit?: number;
  search?: string;
}

export class BookRepository extends BaseRepository<'books'> {
  async store(data: NewBook) {
    return this.create(data);
  }

  async findWithAuthor(id: string): Promise<BookWithAuthor | undefined> {
    return this.withAuthor().where('books.id', '=', id).executeTakeFirst();
  }

  /**
   * Pagine les livres (avec le nom de leur auteur).
   *
   * Le filtre `search` est appliqué AVANT la pagination (WHERE avant LIMIT/OFFSET) et
   * de façon identique sur les deux requêtes exécutées en parallèle :
   * - `rowsQuery` : lignes de la page courante
   * - `countQuery` : total des lignes correspondantes (sans LIMIT/OFFSET)
   *
   * Ainsi `meta.total` reflète la recherche appliquée et `meta.totalPages` reste correct.
   *
   * @param params `page` (1 par défaut), `limit` (10 par défaut), `search` (titre ou auteur)
   */
  async getPaginated(params: GetPaginatedParams = {}): Promise<Paginated<BookWithAuthor>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const search = params.search?.trim();

    const rowsQuery = this.withAuthor()
      .orderBy('books.created_at', 'desc')
      .limit(limit)
      .offset((page - 1) * limit);

    const countQuery = this.db
      .selectFrom('books')
      .innerJoin('authors', 'authors.id', 'books.author_id')
      .select((eb) => eb.fn.countAll().as('count'));

    const [rows, totalRow] = await Promise.all([
      (search ? this.applySearch(rowsQuery, search) : rowsQuery).execute(),
      (search ? this.applySearch(countQuery, search) : countQuery).executeTakeFirst(),
    ]);

    const total = Number(totalRow?.count ?? 0);

    return {
      data: rows,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Base de requête commune pour les livres avec leur auteur.
   *
   * Joint `authors` et sélectionne les colonnes du livre ainsi que le nom de
   * l'auteur (alias `author_name`). L'`innerJoin` est sans risque car
   * `books.author_id` est `NOT NULL` avec clé étrangère : un livre a toujours
   * un auteur, donc aucune ligne n'est exclue.
   */
  private withAuthor() {
    return this.db
      .selectFrom('books')
      .innerJoin('authors', 'authors.id', 'books.author_id')
      .select([
        'books.id',
        'books.title',
        'books.author_id',
        'books.publication_year',
        'books.status',
        'books.created_at',
        'books.updated_at',
        'authors.name as author_name',
      ]);
  }

  /**
   * Applique un filtre de recherche `ILIKE` sur le titre du livre **ou** le nom de l'auteur
   * [`books.title` / `authors.name`].
   *
   * Générique sur `O` : le type de la requête passée en entrée est conservé, ce qui permet
   * d'appliquer exactement le même filtre sur la requête de lignes et celle de comptage (count).
   *
   * @param qb Requête à filtrer (doit référencer `books` et `authors`)
   * @param search Terme à rechercher
   */
  private applySearch<O>(
    qb: SelectQueryBuilder<DB, 'books' | 'authors', O>,
    search: string,
  ): SelectQueryBuilder<DB, 'books' | 'authors', O> {
    return qb.where((eb) =>
      eb.or([
        eb(eb.ref('books.title'), 'ilike', `%${search}%`),
        eb(eb.ref('authors.name'), 'ilike', `%${search}%`),
      ]),
    );
  }
}

export const Book = new BookRepository('books');
