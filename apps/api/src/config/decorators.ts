export const HttpMethod = ['get', 'post', 'put', 'delete', 'patch'] as const

type Method = (typeof HttpMethod)[number]

export const ROUTE_META = Symbol('routeMeta')

export function Get(path: string) {
  return (target: any) => {
    target[ROUTE_META] = { method: 'get' as Method, path }
  }
}
