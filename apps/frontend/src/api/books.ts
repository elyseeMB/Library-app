import { api, type QueryParams, toQuery } from '../helpers/http';
import type { Book, BookInput, Pagination } from '../types';

export const BooksApi = {
  list: (params: QueryParams = {}) =>
    api.get<Pagination<Book>>(`/books${toQuery({ page: 1, limit: 10, ...params })}`),
  store: (data: BookInput) => api.post<Book>('/books', data),
  update: (id: string, data: Partial<BookInput>) => api.patch<Book>(`/books/${id}`, data),
  remove: (id: string) => api.delete<Book>(`/books/${id}`),
};
