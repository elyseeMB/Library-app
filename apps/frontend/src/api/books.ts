import { api, type QueryParams, toQuery } from '../helpers/http';
import type { Book, BookInput } from '../types';

export const BooksApi = {
  list: (params: QueryParams = {}) => api.get<Book[]>(`/books${toQuery(params)}`),
  store: (data: BookInput) => api.post<Book>('/books', data),
  update: (id: string, data: Partial<BookInput>) => api.patch<Book>(`/books/${id}`, data),
  remove: (id: string) => api.delete<Book>(`/books/${id}`),
};
