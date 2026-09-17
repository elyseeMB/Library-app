import type { Request, Response } from 'express';
import { BaseAction } from '#actions/base_action';
import { Get } from '#config/decorators';
import { Author } from '#repositories/author_repository';

@Get('/authors/:id')
export default class ShowAuthor extends BaseAction {
  async asController(req: Request<{ id: string }>, res: Response) {
    const author = await this.handle(req.params.id);
    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }
    return author;
  }

  async handle(id: string) {
    return await Author.find(id);
  }
}
