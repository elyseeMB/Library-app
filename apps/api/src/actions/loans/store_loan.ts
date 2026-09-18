import type { Infer } from '@vinejs/vine/types';
import type { Request, Response } from 'express';
import { BaseAction } from '#actions/base_action';
import { Post } from '#config/decorators';
import { Loan, type NewLoan } from '#repositories/loan_repository';
import { storeLoanValidator } from '#validators/loans_validator';

@Post('/loans')
export default class StoreLoan extends BaseAction {
  validator = storeLoanValidator;

  async asController(_req: Request, res: Response, data?: Infer<typeof storeLoanValidator>) {
    const result = await this.handle(data as NewLoan);

    if (!result.ok) {
      if (result.reason === 'book_not_found' || result.reason === 'member_not_found') {
        const message =
          result.reason === 'member_not_found' ? 'Member not found' : 'Book not found';
        return res.status(404).json({ message });
      }
      return res.status(409).json({ message: 'Book is already borrowed' });
    }

    return result.loan;
  }

  async handle(args: NewLoan) {
    return await Loan.store(args);
  }
}
