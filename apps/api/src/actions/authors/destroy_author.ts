import type { Request, Response } from 'express';
import { BaseAction } from '#actions/base_action';
import { Delete } from '#config/decorators';
import { Author } from '#repositories/author_repository';

@Delete('/authors/:id')
export default class DestroyAuthor extends BaseAction {
  async asController(req: Request<{ id: string }>, res: Response) {
    const author = await this.handle(req.params.id);
    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }
    return author;
  }
  async handle(id: string) {
    return await Author.delete(id);
  }
}
