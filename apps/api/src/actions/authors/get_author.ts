import type { Request, Response } from 'express';
import { BaseAction } from '#actions/base_action';
import { Get } from '#config/decorators';
import { Author } from '#repositories/author_repository';

@Get('/authors')
export default class GetAuthor extends BaseAction {
  async asController(_: Request, _res: Response) {
    return await this.handle();
  }

  async handle() {
    return await Author.all();
  }
}
