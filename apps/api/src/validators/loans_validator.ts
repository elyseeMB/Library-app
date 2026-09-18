import vine from '@vinejs/vine';

const schema = vine.object({
  member_id: vine.string(),
  book_id: vine.string(),
  due_date: vine.date(),
});

export const storeLoanValidator = vine.create(schema);
