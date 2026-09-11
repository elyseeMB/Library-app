import { routes } from './builder.ts'

export function userRoutes() {
  return routes((router) =>
    router.route(() => import('#actions/users/get_user_profile', import.meta.hot?.boundary)),
  )
}
