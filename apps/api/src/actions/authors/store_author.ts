import type { Infer } from '@vinejs/vine/types';
import type { Request, Response } from 'express';
import { BaseAction } from '#actions/base_action';
import { Post } from '#config/decorators';
import { isUniqueViolation } from '#helpers/database';
import { Author, type NewAuthor } from '#repositories/author_repository';
import { storeAuthorValidator } from '#validators/authors_validator';

@Post('/authors')
export default class StoreAuthor extends BaseAction {
  validator = storeAuthorValidator;

  async asController(_req: Request, res: Response, data?: Infer<typeof storeAuthorValidator>) {
    try {
      return await this.handle(data as NewAuthor);
    } catch (error) {
      if (isUniqueViolation(error)) {
        return res.status(409).json({ message: 'Email already exists' });
      }
      throw error;
    }
  }

  async handle(args: NewAuthor) {
    return await Author.store({ ...args });
  }
}
