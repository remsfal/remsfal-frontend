import type { RouteLocationNormalizedLoaded, RouteLocationRaw } from 'vue-router';

type QueryValue = string | null | (string | null)[] | undefined;
type QueryRecord = Record<string, QueryValue>;

/**
 * Normalizes a scalar-or-array query value into a sorted array so a single value
 * and a 1-element array compare equal, and two arrays compare equal regardless of
 * order (vue-router/axios don't guarantee order is preserved for repeated query keys).
 */
function compareQueryValues(a: string | null, b: string | null): number {
  if (a === null) return b === null ? 0 : -1;
  if (b === null) return 1;
  return a.localeCompare(b);
}

function toSortedList(value: QueryValue): (string | null)[] {
  let list: (string | null)[];
  if (value === undefined) {
    list = [];
  } else {
    list = Array.isArray(value) ? value : [value];
  }
  return [...list].sort(compareQueryValues);
}

function valuesMatch(a: QueryValue, b: QueryValue): boolean {
  const listA = toSortedList(a);
  const listB = toSortedList(b);
  if (listA.length !== listB.length) return false;
  return listA.every((value, index) => value === listB[index]);
}

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

  return targetKeys.every((key) => valuesMatch(targetQuery[key], routeQuery[key]));
}

function matchesStringTarget(route: RouteLocationNormalizedLoaded, target: string): boolean {
  const [matchPath, queryString] = target.split('?');
  if (!matchPath || matchPath === '/') return false;
  if (!route.path.startsWith(matchPath)) return false;
  if (!queryString) return true;

  const targetQuery = Object.fromEntries(new URLSearchParams(queryString));
  return matchesQueryParams(targetQuery, (route.query ?? {}) as QueryRecord);
}

function matchesNamedTarget(
  route: RouteLocationNormalizedLoaded,
  target: Extract<RouteLocationRaw, { name?: unknown }>,
): boolean {
  if (route.name !== target.name) return false;
  return matchesQueryParams((target.query ?? {}) as QueryRecord, (route.query ?? {}) as QueryRecord);
}

function matchesPathTarget(
  route: RouteLocationNormalizedLoaded,
  target: Extract<RouteLocationRaw, { path?: unknown }>,
): boolean {
  if (!target.path || !route.path.startsWith(target.path)) return false;
  return matchesQueryParams((target.query ?? {}) as QueryRecord, (route.query ?? {}) as QueryRecord);
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

  if (typeof target === 'string') return matchesStringTarget(route, target);
  if ('name' in target && target.name) return matchesNamedTarget(route, target);
  if ('path' in target && target.path) return matchesPathTarget(route, target);

  return false;
}
