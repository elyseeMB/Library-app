import { faker } from '@faker-js/faker';
import type { Insertable } from 'kysely';
import type { LoanHistoryActionType } from '#enums/loan_history_action';
import type { DB } from '#types/db';

type NewLoanHistory = Insertable<DB['loan_history']>;

export function loanHistoryFactory(
  loanId: string,
  action: LoanHistoryActionType,
  overrides: Partial<NewLoanHistory> = {},
): NewLoanHistory {
  return {
    loan_id: loanId,
    action,
    occurred_at: faker.date.recent(),
    ...overrides,
  };
}

export function loanHistoriesFactory(
  loanId: string,
  actions: LoanHistoryActionType,
  count: number,
  overrides: Partial<NewLoanHistory> = {},
): NewLoanHistory[] {
  return Array.from({ length: count }, () => loanHistoryFactory(loanId, actions, overrides));
}
