import type { Infer } from '@vinejs/vine/types';
import type { Request, Response } from 'express';
import { BaseAction } from '#actions/base_action';
import { Post } from '#config/decorators';
import { isUniqueViolation } from '#helpers/database';
import { Member, type NewMember } from '#repositories/member_repository';
import { storeMemberValidator } from '#validators/members_validator';

@Post('/members')
export default class StoreMember extends BaseAction {
  validator = storeMemberValidator;

  async asController(_: Request, res: Response, data?: Infer<typeof storeMemberValidator>) {
    try {
      return await this.handle(data as NewMember);
    } catch (error) {
      if (isUniqueViolation(error)) {
        return res.status(409).json({ message: 'Email already exists' });
      }
      throw error;
    }
  }

  async handle(args: NewMember) {
    return await Member.store(args);
  }
}
