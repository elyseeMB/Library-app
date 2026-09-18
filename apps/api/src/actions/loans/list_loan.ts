import type { Request } from 'express';
import { BaseAction } from '#actions/base_action';
import { Get } from '#config/decorators';
import { Loan, type LoanStatus, type LoanWithDetails } from '#repositories/loan_repository';

@Get('/loans')
export default class ListLoan extends BaseAction {
  async asController(req: Request) {
    const status: LoanStatus = req.query.status === 'overdue' ? 'overdue' : 'current';
    return await this.handle({ status });
  }

  async handle(params: { status?: LoanStatus }): Promise<LoanWithDetails[]> {
    return await Loan.list(params);
  }
}
