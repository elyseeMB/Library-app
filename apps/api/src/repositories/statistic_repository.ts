import type { Kysely, SelectQueryBuilder } from 'kysely';
import { db as defaultDb } from '#config/database';
import type { DB } from '#types/db';

export interface TopBook {
  book_id: string;
  title: string;
  count: number;
}

export interface TopMember {
  member_id: string;
  name: string;
  count: number;
}

export interface DashboardStats {
  books: number;
  members: number;
  loans_current: number;
  loans_overdue: number;
  most_borrowed_book: TopBook | null;
  most_active_member: TopMember | null;
}

/**
 * Agrégats du tableau de bord, calculés sur plusieurs tables (`books`, `members`, `loans`).
 */
export class StatisticRepository {
  constructor(private db: Kysely<DB> = defaultDb) {}

  async dashboard(): Promise<DashboardStats> {
    const [books, members, loansCurrent, loansOverdue, mostBorrowedBook, mostActiveMember] =
      await Promise.all([
        this.countBooks(),
        this.countMembers(),
        this.countCurrentLoans(),
        this.countOverdueLoans(),
        this.mostBorrowedBook(),
        this.mostActiveMember(),
      ]);

    return {
      books,
      members,
      loans_current: loansCurrent,
      loans_overdue: loansOverdue,
      most_borrowed_book: mostBorrowedBook,
      most_active_member: mostActiveMember,
    };
  }

  private async countBooks(): Promise<number> {
    return this.count('books');
  }

  private async countMembers(): Promise<number> {
    return this.count('members');
  }

  private async countCurrentLoans(): Promise<number> {
    return this.count('loans', (qb) => qb.where('returned_at', 'is', null));
  }

  private async countOverdueLoans(): Promise<number> {
    return this.count('loans', (qb) =>
      qb.where('returned_at', 'is', null).where('due_date', '<', new Date()),
    );
  }

  private async count(
    table: 'books' | 'members' | 'loans',
    apply?: <O>(
      qb: SelectQueryBuilder<DB, typeof table, O>,
    ) => SelectQueryBuilder<DB, typeof table, O>,
  ): Promise<number> {
    let query = this.db.selectFrom(table).select((eb) => eb.fn.countAll().as('count'));

    if (apply) {
      query = apply(query);
    }

    const row = await query.executeTakeFirst();
    return Number(row?.count ?? 0);
  }

  private async mostBorrowedBook(): Promise<TopBook | null> {
    const row = await this.db
      .selectFrom('loans')
      .innerJoin('books', 'books.id', 'loans.book_id')
      .select(['books.id as book_id', 'books.title'])
      .select((eb) => eb.fn.countAll().as('count'))
      .groupBy('books.id')
      .orderBy('count', 'desc')
      .limit(1)
      .executeTakeFirst();

    if (!row) {
      return null;
    }

    return { book_id: row.book_id, title: row.title, count: Number(row.count) };
  }

  private async mostActiveMember(): Promise<TopMember | null> {
    const row = await this.db
      .selectFrom('loans')
      .innerJoin('members', 'members.id', 'loans.member_id')
      .select(['members.id as member_id', 'members.name'])
      .select((eb) => eb.fn.countAll().as('count'))
      .groupBy('members.id')
      .orderBy('count', 'desc')
      .limit(1)
      .executeTakeFirst();

    if (!row) {
      return null;
    }

    return { member_id: row.member_id, name: row.name, count: Number(row.count) };
  }
}

export const Stats = new StatisticRepository();
