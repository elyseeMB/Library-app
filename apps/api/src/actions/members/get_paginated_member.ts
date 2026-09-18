import type { Request, Response } from 'express';
import { BaseAction } from '#actions/base_action';
import { Get } from '#config/decorators';
import type { Paginated } from '#repositories/base_repository';
import {
  type GetMemberParams,
  type Member,
  Member as MemberRepository,
} from '#repositories/member_repository';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

@Get('/members')
export default class GetPaginatedMember extends BaseAction {
  async asController(req: Request, _res: Response) {
    const page = this.toPositiveInt(req.query.page, DEFAULT_PAGE);
    const limit = Math.min(this.toPositiveInt(req.query.limit, DEFAULT_LIMIT), MAX_LIMIT);

    return await this.handle({ page, limit });
  }

  async handle(params: GetMemberParams): Promise<Paginated<Member>> {
    return await MemberRepository.getPaginated(params);
  }

  private toPositiveInt(value: unknown, fallback: number): number {
    const n = Number(value);
    return Number.isSafeInteger(n) && n >= 1 ? n : fallback;
  }
}
