import type { Request, Response } from 'express';
import { BaseAction } from '#actions/base_action';
import { Get } from '#config/decorators';
import { Stats } from '#repositories/statistic_repository';

@Get('/stats')
export default class GetStat extends BaseAction {
  async asController(_req: Request, _res: Response) {
    return await this.handle();
  }

  async handle() {
    return await Stats.dashboard();
  }
}
