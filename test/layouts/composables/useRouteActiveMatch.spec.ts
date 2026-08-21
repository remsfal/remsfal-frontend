import { describe, it, expect } from 'vitest';
import type { RouteLocationNormalizedLoaded } from 'vue-router';
import { matchesRouteTarget } from '@/layouts/composables/useRouteActiveMatch';

const baseRoute = (overrides: Partial<RouteLocationNormalizedLoaded>): RouteLocationNormalizedLoaded => ({
  path: '/projects/123/issues',
  name: 'IssueOverview',
  params: { projectId: '123' },
  query: {},
  hash: '',
  fullPath: '',
  matched: [],
  meta: {},
  redirectedFrom: undefined,
  ...overrides,
}) as RouteLocationNormalizedLoaded;

describe('matchesRouteTarget — array-valued query params', () => {
  it('matches when array values are equal but in a different order', () => {
    const route = baseRoute({ query: { status: ['IN_PROGRESS', 'OPEN'] } });
    const result = matchesRouteTarget(route, {
      name: 'IssueOverview',
      query: { status: ['OPEN', 'IN_PROGRESS'] },
    });
    expect(result).toBe(true);
  });

  it('does not match when the route is missing one of the target array values', () => {
    const route = baseRoute({ query: { status: ['OPEN'] } });
    const result = matchesRouteTarget(route, {
      name: 'IssueOverview',
      query: { status: ['OPEN', 'IN_PROGRESS'] },
    });
    expect(result).toBe(false);
  });

  it('does not match when the target array has fewer values than the route', () => {
    const route = baseRoute({ query: { status: ['OPEN', 'IN_PROGRESS'] } });
    const result = matchesRouteTarget(route, {
      name: 'IssueOverview',
      query: { status: ['OPEN'] },
    });
    expect(result).toBe(false);
  });

  it('treats a scalar target value and a 1-element route array as equal', () => {
    const route = baseRoute({ query: { status: ['OPEN'] } });
    const result = matchesRouteTarget(route, {
      name: 'IssueOverview',
      query: { status: 'OPEN' },
    });
    expect(result).toBe(true);
  });

  it('does not match a subset: fewer keys than the route (exact key-set regression)', () => {
    const route = baseRoute({ query: { status: ['OPEN', 'IN_PROGRESS'], type: 'DEFECT' } });
    const result = matchesRouteTarget(route, {
      name: 'IssueOverview',
      query: { status: ['OPEN', 'IN_PROGRESS'] },
    });
    expect(result).toBe(false);
  });

  it('distinguishes two multi-type arrays with the same length but different values', () => {
    const route = baseRoute({ query: { type: ['APPLICATION', 'INQUIRY', 'TASK', 'TERMINATION'] } });
    const result = matchesRouteTarget(route, {
      name: 'IssueOverview',
      query: { type: ['DEFECT', 'INQUIRY', 'TASK', 'TERMINATION'] },
    });
    expect(result).toBe(false);
  });

  it('matches an empty-query target ("Alle Aufgaben") only against an empty route query', () => {
    const route = baseRoute({ query: {} });
    const result = matchesRouteTarget(route, { name: 'IssueOverview', query: {} });
    expect(result).toBe(true);
  });

  it('does not match an empty-query target when the route carries any query params', () => {
    const route = baseRoute({ query: { status: ['OPEN', 'IN_PROGRESS'] } });
    const result = matchesRouteTarget(route, { name: 'IssueOverview', query: {} });
    expect(result).toBe(false);
  });

  it('matches null query values (e.g. a value-less "?flag" param) on both sides', () => {
    const route = baseRoute({ query: { flag: null } });
    const result = matchesRouteTarget(route, { name: 'IssueOverview', query: { flag: null } });
    expect(result).toBe(true);
  });

  it('does not match a null query value against a non-null one', () => {
    const route = baseRoute({ query: { flag: 'yes' } });
    const result = matchesRouteTarget(route, { name: 'IssueOverview', query: { flag: null } });
    expect(result).toBe(false);
  });

  it('sorts mixed null/non-null array values consistently on both sides', () => {
    const route = baseRoute({ query: { status: [null, 'A', null, 'B'] } });
    const result = matchesRouteTarget(route, {
      name: 'IssueOverview',
      query: { status: ['B', null, 'A', null] },
    });
    expect(result).toBe(true);
  });

  it('does not match when target and route have the same number of keys but different names', () => {
    const route = baseRoute({ query: { type: 'OPEN' } });
    const result = matchesRouteTarget(route, { name: 'IssueOverview', query: { status: 'OPEN' } });
    expect(result).toBe(false);
  });
});

describe('matchesRouteTarget — string target', () => {
  it('returns false for an empty target string', () => {
    const route = baseRoute({});
    expect(matchesRouteTarget(route, '')).toBe(false);
  });

  it('returns false for the root path "/"', () => {
    const route = baseRoute({});
    expect(matchesRouteTarget(route, '/')).toBe(false);
  });

  it('returns false when the route path does not start with the target path', () => {
    const route = baseRoute({ path: '/projects/123/issues' });
    expect(matchesRouteTarget(route, '/manager')).toBe(false);
  });

  it('matches a plain path prefix without a query string', () => {
    const route = baseRoute({ path: '/projects/123/issues' });
    expect(matchesRouteTarget(route, '/projects/123')).toBe(true);
  });

  it('matches a path with a query string that equals the route query', () => {
    const route = baseRoute({ path: '/projects/123/issues', query: { status: 'OPEN' } });
    expect(matchesRouteTarget(route, '/projects/123/issues?status=OPEN')).toBe(true);
  });

  it('does not match a path with a query string that differs from the route query', () => {
    const route = baseRoute({ path: '/projects/123/issues', query: { status: 'CLOSED' } });
    expect(matchesRouteTarget(route, '/projects/123/issues?status=OPEN')).toBe(false);
  });

  it('treats a missing route.query as an empty query when the target has a query string', () => {
    const route = baseRoute({ path: '/projects/123/issues', query: undefined });
    expect(matchesRouteTarget(route, '/projects/123/issues?status=OPEN')).toBe(false);
  });
});

describe('matchesRouteTarget — named target', () => {
  it('does not match when the route name differs from the target name', () => {
    const route = baseRoute({ name: 'IssueOverview' });
    const result = matchesRouteTarget(route, { name: 'ProjectDashboard' });
    expect(result).toBe(false);
  });

  it('treats a missing target.query and a missing route.query as equal (both empty)', () => {
    const route = baseRoute({ name: 'IssueOverview', query: undefined });
    const result = matchesRouteTarget(route, { name: 'IssueOverview' });
    expect(result).toBe(true);
  });
});

describe('matchesRouteTarget — path-object target', () => {
  it('matches a path-object target whose path is a prefix and whose query matches', () => {
    const route = baseRoute({ path: '/projects/123/issues', query: {} });
    const result = matchesRouteTarget(route, { path: '/projects/123' });
    expect(result).toBe(true);
  });

  it('does not match a path-object target whose path is not a prefix of the route', () => {
    const route = baseRoute({ path: '/projects/123/issues' });
    const result = matchesRouteTarget(route, { path: '/manager' });
    expect(result).toBe(false);
  });

  it('treats a missing target.query and a missing route.query as equal (both empty)', () => {
    const route = baseRoute({ path: '/projects/123/issues', query: undefined });
    const result = matchesRouteTarget(route, { path: '/projects/123' });
    expect(result).toBe(true);
  });
});

describe('matchesRouteTarget — edge cases', () => {
  it('returns false when no target is given', () => {
    const route = baseRoute({});
    expect(matchesRouteTarget(route, undefined)).toBe(false);
  });

  it('returns false for a target that is neither a string, name, nor path', () => {
    const route = baseRoute({});
    const result = matchesRouteTarget(route, { query: { status: 'OPEN' } });
    expect(result).toBe(false);
  });
});
