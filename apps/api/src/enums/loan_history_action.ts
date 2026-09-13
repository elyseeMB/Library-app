export const LoanHistoryAction = {
  Borrowed: 'borrowed',
  Returned: 'returned',
} as const;

export type LoanHistoryActionType = (typeof LoanHistoryAction)[keyof typeof LoanHistoryAction];
