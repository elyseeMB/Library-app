import type { Request, Response } from 'express';
import { BaseAction } from '#actions/base_action';
import { Delete } from '#config/decorators';
import { isForeignKeyViolation } from '#helpers/database';
import { Member } from '#repositories/member_repository';

@Delete('/members/:id')
export default class DestroyMember extends BaseAction {
  async asController(req: Request<{ id: string }>, res: Response) {
    try {
      const member = await this.handle(req.params.id);
      if (!member) {
        return res.status(404).json({ message: 'Member not found' });
      }
      return member;
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        return res.status(409).json({ message: 'Member has loans' });
      }
      throw error;
    }
  }

  async handle(id: string) {
    return await Member.delete(id);
  }
}
