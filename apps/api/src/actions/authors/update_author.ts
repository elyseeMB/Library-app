import type { Infer } from '@vinejs/vine/types';
import type { Request, Response } from 'express';
import { BaseAction } from '#actions/base_action';
import { Put } from '#config/decorators';
import { isUniqueViolation } from '#helpers/database';
import { Author, type AuthorUpdate } from '#repositories/author_repository';
import { updateAuthorValidator } from '#validators/authors_validator';

@Put('/authors/:id')
export default class UpdateAuthor extends BaseAction {
  validator = updateAuthorValidator;

  async asController(
    req: Request<{ id: string }>,
    res: Response,
    data?: Infer<typeof updateAuthorValidator>,
  ) {
    try {
      const author = await this.handle(req.params.id, data as AuthorUpdate);
      if (!author) {
        return res.status(404).json({ message: 'Author not found' });
      }
      return author;
    } catch (error) {
      if (isUniqueViolation(error)) {
        return res.status(409).json({ message: 'Email already exists' });
      }
      throw error;
    }
  }
  async handle(id: string, data: AuthorUpdate) {
    return await Author.update(id, data);
  }
}
