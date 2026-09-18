import type { Insertable, Selectable, SelectQueryBuilder, Updateable } from 'kysely';
import { BaseRepository } from '#repositories/base_repository';
import type { DB } from '#types/db';

export type Loan = Selectable<DB['loans']>;
export type NewLoan = Insertable<DB['loans']>;
export type LoanUpdate = Updateable<DB['loans']>;

export type LoanStatus = 'current' | 'overdue';

export type LoanWithDetails = {
  id: string;
  book_id: string;
  book_title: string;
  member_id: string;
  member_name: string;
  borrowed_at: Date;
  due_date: Date;
  returned_at: Date | null;
  state: LoanStatus;
};

export type StoreLoanResult =
  | { ok: true; loan: Loan }
  | { ok: false; reason: 'book_not_found' | 'member_not_found' | 'book_unavailable' };

export type ReturnLoanResult =
  | { ok: true; loan: Loan }
  | { ok: false; reason: 'not_found' | 'already_returned' };

export class LoanRepository extends BaseRepository<'loans'> {
  /**
   * Enregistre un emprunt dans une transaction : le livre doit être `available` puis
   * passe à `borrowed` immédiatement, de façon atomique avec l'insertion de l'emprunt.
   *
   * La mise à jour conditionnelle (`AND status = 'available'`) protège contre le cas où
   * deux emprunts seraient créés en parallèle pour le même livre.
   */
  async store(data: NewLoan): Promise<StoreLoanResult> {
    return this.db.transaction().execute(async (trx) => {
      const book = await trx
        .selectFrom('books')
        .select('status')
        .where('id', '=', data.book_id)
        .executeTakeFirst();

      if (!book) {
        return { ok: false, reason: 'book_not_found' };
      }

      if (book.status !== 'available') {
        return { ok: false, reason: 'book_unavailable' };
      }

      const member = await trx
        .selectFrom('members')
        .select('id')
        .where('id', '=', data.member_id)
        .executeTakeFirst();

      if (!member) {
        return { ok: false, reason: 'member_not_found' };
      }

      const updated = await trx
        .updateTable('books')
        .set({ status: 'borrowed' })
        .where('id', '=', data.book_id)
        .where('status', '=', 'available')
        .returningAll()
        .executeTakeFirst();

      if (!updated) {
        return { ok: false, reason: 'book_unavailable' };
      }

      const loan = await trx
        .insertInto('loans')
        .values(data)
        .returningAll()
        .executeTakeFirstOrThrow();

      return { ok: true, loan };
    });
  }

  /**
   * Enregistre le retour d'un livre dans une transaction : l'emprunt reçoit `returned_at`
   * et le livre repasse à `available`, de façon atomique.
   */
  async returnLoan(loanId: string): Promise<ReturnLoanResult> {
    return this.db.transaction().execute(async (trx) => {
      const loan = await trx
        .selectFrom('loans')
        .selectAll()
        .where('id', '=', loanId)
        .executeTakeFirst();

      if (!loan) {
        return { ok: false, reason: 'not_found' };
      }

      if (loan.returned_at) {
        return { ok: false, reason: 'already_returned' };
      }

      const returned = await trx
        .updateTable('loans')
        .set({ returned_at: new Date() })
        .where('id', '=', loanId)
        .returningAll()
        .executeTakeFirst();

      if (!returned) {
        return { ok: false, reason: 'not_found' };
      }

      await trx
        .updateTable('books')
        .set({ status: 'available' })
        .where('id', '=', loan.book_id)
        .execute();

      return { ok: true, loan: returned };
    });
  }

  /**
   * Liste tous les emprunts (`current` par défaut, ou `overdue`) avec le titre du livre
   * et le nom de l'adhérent, du plus récent au plus ancien. Tri générateur déterministe
   * via l'`id` (unique) ajouté comme critère de départage.
   *
   * @param params `status` (`'current'` = non rendu, `'overdue'` = non rendu et `due_date` dépassée)
   */
  async list(params: { status?: LoanStatus } = {}): Promise<LoanWithDetails[]> {
    const status = params.status ?? 'current';

    const rows = await this.applyStatus(
      this.withDetails().orderBy('loans.borrowed_at', 'desc').orderBy('loans.id', 'asc'),
      status,
    ).execute();

    return rows.map((row) => ({ ...row, state: status }));
  }

  /**
   * Base de requête commune : emprunt + titre du livre + nom de l'adhérent.
   */
  private withDetails() {
    return this.db
      .selectFrom('loans')
      .innerJoin('books', 'books.id', 'loans.book_id')
      .innerJoin('members', 'members.id', 'loans.member_id')
      .select([
        'loans.id',
        'loans.book_id',
        'books.title as book_title',
        'loans.member_id',
        'members.name as member_name',
        'loans.borrowed_at',
        'loans.due_date',
        'loans.returned_at',
      ]);
  }

  /**
   * Applique le filtre d'état sur une requête d'emprunts (lignes comme comptage).
   */
  private applyStatus<O>(
    qb: SelectQueryBuilder<DB, 'loans' | 'books' | 'members', O>,
    status: LoanStatus,
  ): SelectQueryBuilder<DB, 'loans' | 'books' | 'members', O> {
    let query = qb.where('loans.returned_at', 'is', null);

    if (status === 'overdue') {
      query = query.where('loans.due_date', '<', new Date());
    }

    return query;
  }
}

export const Loan = new LoanRepository('loans');
