import { BaseAction } from '#actions/base_action'

export default class GetComments extends BaseAction {
  handle(id: string) {
    return {
      [id]: {
        body: 'Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit...',
      },
    }
  }
}
