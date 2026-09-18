import { api, type QueryParams, toQuery } from '../helpers/http';
import type { Member, MemberInput, MemberLoan, Pagination } from '../types';

export const MembersApi = {
  list: (params: QueryParams = {}) =>
    api.get<Pagination<Member>>(`/members${toQuery({ page: 1, limit: 10, ...params })}`),
  store: (data: MemberInput) => api.post<Member>('/members', data),
  update: (id: string, data: Partial<MemberInput>) => api.patch<Member>(`/members/${id}`, data),
  remove: (id: string) => api.delete<Member>(`/members/${id}`),
  loans: (id: string) => api.get<MemberLoan[]>(`/members/${id}/loans`),
};
