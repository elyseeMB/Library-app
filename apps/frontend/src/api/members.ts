import { api } from '../helpers/http';
import type { Member, MemberInput, MemberLoan } from '../types';

export const MembersApi = {
  list: () => api.get<Member[]>('/members'),
  store: (data: MemberInput) => api.post<Member>('/members', data),
  update: (id: string, data: Partial<MemberInput>) => api.patch<Member>(`/members/${id}`, data),
  remove: (id: string) => api.delete<Member>(`/members/${id}`),
  loans: (id: string) => api.get<MemberLoan[]>(`/members/${id}/loans`),
};
