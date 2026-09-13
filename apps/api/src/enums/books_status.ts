export const BookStatus = {
  Available: 1,
  Borrowed: 2,
  Reserved: 3,
  Lost: 4,
  Damaged: 5,
  Archived: 6,
} as const;

export const BooksStatusText = {
  [BookStatus.Available]: 'available',
  [BookStatus.Borrowed]: 'borrowed',
  [BookStatus.Reserved]: 'reserved',
  [BookStatus.Lost]: 'lost',
  [BookStatus.Damaged]: 'damaged',
  [BookStatus.Archived]: 'archived',
} as const;
