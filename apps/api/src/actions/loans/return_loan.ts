import type { Request, Response } from 'express';
import { BaseAction } from '#actions/base_action';
import { Post } from '#config/decorators';
import { Loan, type ReturnLoanResult } from '#repositories/loan_repository';

@Post('/loans/:id/return')
export default class ReturnLoan extends BaseAction {
  async asController(req: Request<{ id: string }>, res: Response) {
    const result = await this.handle(req.params.id);

    if (!result.ok) {
      if (result.reason === 'not_found') {
        return res.status(404).json({ message: 'Loan not found' });
      }
      return res.status(409).json({ message: 'Loan already returned' });
    }

    return result.loan;
  }

  async handle(id: string): Promise<ReturnLoanResult> {
    return await Loan.returnLoan(id);
  }
}
