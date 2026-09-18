import type { Insertable, Selectable, Updateable } from 'kysely';
import { BaseRepository } from '#repositories/base_repository';
import type { DB } from '#types/db';

export type Member = Selectable<DB['members']>;
export type NewMember = Insertable<DB['members']>;
export type MemberUpdate = Updateable<DB['members']>;

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
   * Liste tous les adhérents, du plus récent au plus ancien.
   *
   * Tri rendu déterministe par l'ajout de l'`id` comme critère de départage.
   */
  async list(): Promise<Member[]> {
    return await this.db
      .selectFrom('members')
      .selectAll()
      .orderBy('created_at', 'desc')
      .orderBy('id', 'asc')
      .execute();
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
      .orderBy('loans.id', 'asc')
      .execute();

    return loans.map((loan) => ({
      ...loan,
      state: loan.returned_at ? 'returned' : 'current',
    }));
  }
}

export const Member = new MemberRepository('members');
