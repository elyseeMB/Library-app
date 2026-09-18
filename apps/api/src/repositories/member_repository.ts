import type { Insertable, Selectable, Updateable } from 'kysely';
import { BaseRepository, type Paginated } from '#repositories/base_repository';
import type { DB } from '#types/db';

export type Member = Selectable<DB['members']>;
export type NewMember = Insertable<DB['members']>;
export type MemberUpdate = Updateable<DB['members']>;

export interface GetMemberParams {
  page?: number;
  limit?: number;
}

export type MemberLoan = {
  id: string;
  book_id: string;
  book_title: string;
  borrowed_at: Date;
  due_date: Date;
  returned_at: Date | null;
  state: 'current' | 'returned';
};

export class MemberRepository extends BaseRepository<'members'> {
  async store(data: NewMember) {
    return this.create(data);
  }

  /**
   * Pagine les adhérents (nom + contact : email, téléphone).
   *
   * Même principe que les livres : une requête pour les lignes de la page courante et une
   * pour le total, exécutées en parallèle, afin que `meta.total` et `meta.totalPages`
   * soient cohérents.
   *
   * @param params `page` (1 par défaut), `limit` (10 par défaut)
   */
  async getPaginated(params: GetMemberParams = {}): Promise<Paginated<Member>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;

    const [rows, totalRow] = await Promise.all([
      this.db
        .selectFrom('members')
        .selectAll()
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset((page - 1) * limit)
        .execute(),
      this.db
        .selectFrom('members')
        .select((eb) => eb.fn.countAll().as('count'))
        .executeTakeFirst(),
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
   * Historique des emprunts d'un adhérent (en cours et passés), trié du plus récent au plus ancien.
   *
   * Un emprunt est marqué `state: 'current'` tant que `returned_at` est `null`, sinon `'returned'`.
   *
   * @param memberId id de l'adhérent
   */
  async loansHistory(memberId: string): Promise<MemberLoan[]> {
    const loans = await this.db
      .selectFrom('loans')
      .innerJoin('books', 'books.id', 'loans.book_id')
      .select([
        'loans.id',
        'loans.book_id',
        'books.title as book_title',
        'loans.borrowed_at',
        'loans.due_date',
        'loans.returned_at',
      ])
      .where('loans.member_id', '=', memberId)
      .orderBy('loans.borrowed_at', 'desc')
      .execute();

    return loans.map((loan) => ({
      ...loan,
      state: loan.returned_at ? 'returned' : 'current',
    }));
  }
}

export const Member = new MemberRepository('members');
