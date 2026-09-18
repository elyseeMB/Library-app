import { BaseAction } from '#actions/base_action';
import { Get } from '#config/decorators';
import { type Member, Member as MemberRepository } from '#repositories/member_repository';

@Get('/members')
export default class ListMember extends BaseAction {
  async asController() {
    return await this.handle();
  }

  async handle(): Promise<Member[]> {
    return await MemberRepository.list();
  }
}
