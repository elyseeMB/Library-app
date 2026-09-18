export type Method = (typeof HttpMethod)[number];
export interface RouteMeta {
  method: Method;
  path: string;
}
type RouteTarget = abstract new (...args: any[]) => unknown;

export const HttpMethod = ['get', 'post', 'put', 'delete', 'patch'] as const;

export const ROUTE_META = new WeakMap<RouteTarget, RouteMeta>();

export function Get(path: string) {
  return (target: RouteTarget) => {
    ROUTE_META.set(target, {
      method: 'get',
      path,
    });
  };
}

export function Post(path: string) {
  return (target: RouteTarget) => {
    ROUTE_META.set(target, {
      method: 'post',
      path,
    });
  };
}

export function Put(path: string) {
  return (target: RouteTarget) => {
    ROUTE_META.set(target, {
      method: 'put',
      path,
    });
  };
}

export function Delete(path: string) {
  return (target: RouteTarget) => {
    ROUTE_META.set(target, {
      method: 'delete',
      path,
    });
  };
}
