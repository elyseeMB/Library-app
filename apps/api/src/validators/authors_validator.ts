import vine from '@vinejs/vine';

const schema = vine.object({
  name: vine.string(),
  nationality: vine.string(),
  email: vine.string().email(),
  phone: vine.string().optional(),
  bio: vine.string().optional(),
  website: vine.string().url().optional(),
});

export const storeAuthorValidator = vine.create(schema);
export const updateAuthorValidator = vine.create(schema.partial());
