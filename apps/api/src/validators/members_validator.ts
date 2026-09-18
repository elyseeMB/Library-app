import vine from '@vinejs/vine';

const schema = vine.object({
  name: vine.string(),
  email: vine.string().email(),
  phone: vine.string().optional(),
});

export const storeMemberValidator = vine.create(schema);
export const updateMemberValidator = vine.create(schema.partial());
