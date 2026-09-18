import type { Request, Response } from 'express';
import { BaseAction } from '#actions/base_action';
import { Get } from '#config/decorators';
import { Member } from '#repositories/member_repository';

@Get('/members/:id/loans')
export default class GetMemberLoans extends BaseAction {
  async asController(req: Request<{ id: string }>, res: Response) {
    const member = await Member.find(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    return await this.handle(req.params.id);
  }

  async handle(id: string) {
    return await Member.loansHistory(id);
  }
}
