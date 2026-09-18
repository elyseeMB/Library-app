import type { Request, Response } from 'express';
import { BaseAction } from '#actions/base_action';
import { Get } from '#config/decorators';
import { type GetLoanParams, Loan, type LoanStatus } from '#repositories/loan_repository';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

@Get('/loans')
export default class GetPaginatedLoan extends BaseAction {
  async asController(req: Request, _res: Response) {
    const page = this.toPositiveInt(req.query.page, DEFAULT_PAGE);
    const limit = Math.min(this.toPositiveInt(req.query.limit, DEFAULT_LIMIT), MAX_LIMIT);
    const status: LoanStatus = req.query.status === 'overdue' ? 'overdue' : 'current';

    return await this.handle({ page, limit, status });
  }

  async handle(params: GetLoanParams) {
    return await Loan.getPaginated(params);
  }

  private toPositiveInt(value: unknown, fallback: number): number {
    const n = Number(value);
    return Number.isSafeInteger(n) && n >= 1 ? n : fallback;
  }
}
