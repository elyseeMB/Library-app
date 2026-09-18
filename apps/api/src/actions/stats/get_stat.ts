import { BaseAction } from '#actions/base_action';
import { Get } from '#config/decorators';
import { Stats } from '#repositories/statistic_repository';

@Get('/stats')
export default class GetStat extends BaseAction {
  async asController() {
    return await this.handle();
  }

  async handle() {
    return await Stats.dashboard();
  }
}
