import { api } from '../helpers/http';
import type { Author, AuthorInput } from '../types';

export const AuthorsApi = {
  all: () => api.get<Author[]>('/authors'),
  store: (data: AuthorInput) => api.post<Author>('/authors', data),
  update: (id: string, data: Partial<AuthorInput>) => api.patch<Author>(`/authors/${id}`, data),
  remove: (id: string) => api.delete<Author>(`/authors/${id}`),
};
