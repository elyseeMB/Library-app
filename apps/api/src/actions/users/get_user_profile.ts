import type { Request, Response } from 'express'
import { BaseAction } from '#actions/base_action'
import GetComments from '#actions/comments/get_comments'
import { Get } from '#router/decorators'

@Get('/user/:id')
export default class GetUserProfile extends BaseAction {
  async asController(req: Request, res: Response, data?: unknown, ...args: any[]) {
    const { id } = req.params
    const comments = await GetComments.run(id as string)
    return res.json(comments)
  }
}
