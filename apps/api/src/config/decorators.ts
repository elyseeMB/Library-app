export type Method = (typeof HttpMethod)[number];
export interface RouteMeta {
  method: Method;
  path: string;
}

export const HttpMethod = ['get', 'post', 'put', 'delete', 'patch'] as const;
export const ROUTE_META = new WeakMap<Function, RouteMeta>();

export function Get(path: string) {
  return (target: Function) => {
    ROUTE_META.set(target, {
      method: 'get',
      path,
    });
  };
}
