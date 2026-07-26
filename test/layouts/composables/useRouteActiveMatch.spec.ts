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
});
