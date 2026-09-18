import type { Insertable, Selectable, SelectQueryBuilder, Updateable } from 'kysely';
import { BaseRepository } from '#repositories/base_repository';
import type { DB } from '#types/db';

export type Book = Selectable<DB['books']>;
export type NewBook = Insertable<DB['books']>;
export type BookUpdate = Updateable<DB['books']>;
export type BookWithAuthor = Book & { author_name: string };

export interface ListBooksParams {
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
   * Liste tous les livres (avec le nom de leur auteur), du plus récent au plus ancien.
   *
   * Le tri est rendu déterministe par l'ajout de l'`id` (colonne unique) comme critère
   * de départage, afin que l'ordre de la liste reste stable entre deux requêtes.
   *
   * @param params `search` (facultatif) : filtre sur le titre ou le nom de l'auteur
   */
  async list(params: ListBooksParams = {}): Promise<BookWithAuthor[]> {
    const search = params.search?.trim();

    const query = this.withAuthor().orderBy('books.created_at', 'desc').orderBy('books.id', 'asc');

    return await (search ? this.applySearch(query, search) : query).execute();
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
