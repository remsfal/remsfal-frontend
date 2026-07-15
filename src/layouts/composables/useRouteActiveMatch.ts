import type { RouteLocationNormalizedLoaded, RouteLocationRaw } from 'vue-router';

type QueryRecord = Record<string, string | null | (string | null)[] | undefined>;

/**
 * Exact-set equality: a target's declared query keys/values must match the route's
 * query exactly, not merely be a subset of it. This is what keeps e.g. an "all" item
 * (no query) from also lighting up on an "open" item's route (?status=OPEN), and an
 * "open" item (?status=OPEN) from lighting up on a "mine" item's route
 * (?status=OPEN&assigneeId=...).
 */
function matchesQueryParams(targetQuery: QueryRecord, routeQuery: QueryRecord): boolean {
  const targetKeys = Object.keys(targetQuery);
  const routeKeys = Object.keys(routeQuery);

  if (targetKeys.length !== routeKeys.length) return false;

  return targetKeys.every((key) => routeQuery[key] === targetQuery[key]);
}

/**
 * Whether `target` (a menu/nav item's `to`) should be considered the active
 * navigation entry for `route`. Unlike a plain `route.path.startsWith(...)` check,
 * this also compares query params so that sibling items sharing the same path
 * but differing only by query (e.g. `?status=OPEN` vs `?status=CLOSED`) don't
 * all light up together.
 */
export function matchesRouteTarget(route: RouteLocationNormalizedLoaded, target?: RouteLocationRaw): boolean {
  if (!target) return false;

  const routeQuery = (route.query ?? {}) as QueryRecord;

  if (typeof target === 'string') {
    const [matchPath, queryString] = target.split('?');
    if (!matchPath || matchPath === '/') return false;
    if (!route.path.startsWith(matchPath)) return false;
    if (!queryString) return true;
    const targetQuery = Object.fromEntries(new URLSearchParams(queryString));
    return matchesQueryParams(targetQuery, routeQuery);
  }

  if ('name' in target && target.name) {
    if (route.name !== target.name) return false;
    return matchesQueryParams((target.query ?? {}) as QueryRecord, routeQuery);
  }

  if ('path' in target && target.path) {
    if (!route.path.startsWith(target.path)) return false;
    return matchesQueryParams((target.query ?? {}) as QueryRecord, routeQuery);
  }

  return false;
}
