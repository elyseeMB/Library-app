import { api, toQuery } from '../helpers/http';
import type { Loan, LoanFilter, LoanInput, Pagination } from '../types';

export const LoansApi = {
  list: ({ filter, ...rest }: { page?: number; limit?: number; filter?: LoanFilter } = {}) =>
    api.get<Pagination<Loan>>(`/loans${toQuery({ page: 1, limit: 10, status: filter, ...rest })}`),
  store: (data: LoanInput) => api.post<Loan>('/loans', data),
  return: (id: string) => api.post<Loan>(`/loans/${id}/return`),
};
