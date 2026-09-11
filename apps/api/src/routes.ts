import { routes } from '#router/builder'
import { userRoutes } from '#router/definitions'

export function registerRoutes() {
  return routes((r) => {
    r.group('/api/v1', (v1) => {
      v1.mount('/', userRoutes())
    })
  })
}
