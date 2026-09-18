import { api, toQuery } from '../helpers/http';
import type { Loan, LoanFilter, LoanInput } from '../types';

export const LoansApi = {
  list: ({ filter }: { filter?: LoanFilter } = {}) =>
    api.get<Loan[]>(`/loans${toQuery({ status: filter })}`),
  store: (data: LoanInput) => api.post<Loan>('/loans', data),
  return: (id: string) => api.post<Loan>(`/loans/${id}/return`),
};
