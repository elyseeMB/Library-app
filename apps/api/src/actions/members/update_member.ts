import type { Infer } from '@vinejs/vine/types';
import type { Request, Response } from 'express';
import { BaseAction } from '#actions/base_action';
import { Put } from '#config/decorators';
import { isUniqueViolation } from '#helpers/database';
import { Member, type MemberUpdate } from '#repositories/member_repository';
import { updateMemberValidator } from '#validators/members_validator';

@Put('/members/:id')
export default class UpdateMember extends BaseAction {
  validator = updateMemberValidator;

  async asController(
    req: Request<{ id: string }>,
    res: Response,
    data?: Infer<typeof updateMemberValidator>,
  ) {
    try {
      const member = await this.handle(req.params.id, data as MemberUpdate);
      if (!member) {
        return res.status(404).json({ message: 'Member not found' });
      }
      return member;
    } catch (error) {
      if (isUniqueViolation(error)) {
        return res.status(409).json({ message: 'Email already exists' });
      }
      throw error;
    }
  }

  async handle(id: string, data: MemberUpdate) {
    return await Member.update(id, data);
  }
}
