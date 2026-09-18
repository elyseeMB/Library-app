export type Author = {
  id: string;
  name: string;
  nationality: string;
  email: string;
  phone: string | null;
  bio: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
};

export type BookStatus = 'available' | 'borrowed';

export type Book = {
  id: string;
  title: string;
  author_id: string;
  publication_year: number;
  status: BookStatus;
  created_at: string;
  updated_at: string;
  author_name: string;
};

export type Member = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
};

export type LoanFilter = 'current' | 'overdue';

export type Loan = {
  id: string;
  book_id: string;
  book_title: string;
  member_id: string;
  member_name: string;
  borrowed_at: string;
  due_date: string;
  returned_at: string | null;
  state: LoanFilter;
};

export type MemberLoanState = 'current' | 'returned';

export type MemberLoan = {
  id: string;
  book_id: string;
  book_title: string;
  borrowed_at: string;
  due_date: string;
  returned_at: string | null;
  state: MemberLoanState;
};

export type Pagination<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type TopBook = {
  book_id: string;
  title: string;
  count: number;
};

export type TopMember = {
  member_id: string;
  name: string;
  count: number;
};

export type DashboardStats = {
  books: number;
  members: number;
  loans_current: number;
  loans_overdue: number;
  most_borrowed_book: TopBook | null;
  most_active_member: TopMember | null;
};

export type BookInput = {
  title: string;
  author_id: string;
  publication_year: number;
};

export type AuthorInput = {
  name: string;
  nationality: string;
  email: string;
  phone?: string | null;
  bio?: string | null;
  website?: string | null;
};

export type MemberInput = {
  name: string;
  email: string;
  phone?: string | null;
};

export type LoanInput = {
  member_id: string;
  book_id: string;
  due_date: string;
};
