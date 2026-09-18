import vine from '@vinejs/vine';
import { BooksStatusText } from '#enums/books_status';

const schema = vine.object({
  title: vine.string(),
  author_id: vine.string(),
  publication_year: vine.number(),
  status: vine.enum(Object.values(BooksStatusText)).optional(),
});

export const storeBookValidator = vine.create(schema);
export const updateBookValidator = vine.create(schema.partial());
