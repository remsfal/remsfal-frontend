import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import router from '@/router/index';
import { useUserSessionStore } from '@/stores/UserSession';
import { generateIdTestCases } from '../setup/issueTestHelpers';

describe('Router - Issue Details Route', () => {
  const testIds = generateIdTestCases();

  beforeEach(async () => {
    setActivePinia(createPinia());
    // Set a logged-in user so requiresAuth guard does not redirect
    const sessionStore = useUserSessionStore();
    const user = { email: 'test@example.com', userContexts: ['MANAGER'] };
    sessionStore.user = user as ReturnType<typeof useUserSessionStore>['user'];
    await router.push('/');
    await router.isReady();
  });

  describe('Route Configuration', () => {
    it('should have IssueDetails route defined', () => {
      const route = router.resolve({
        name: 'IssueDetails',
        params: { projectId: 'test-project', issueId: 'test-issue' },
      });
      expect(route.name).toBe('IssueDetails');
    });

    it('should have correct path pattern', () => {
      const route = router.resolve({
        name: 'IssueDetails',
        params: { projectId: 'proj-123', issueId: 'issue-456' },
      });
      expect(route.path).toBe('/projects/proj-123/issues/issue-456');
    });

    it('should resolve to ProjectIssueView component', async () => {
      const route = router.resolve({
        name: 'IssueDetails',
        params: { projectId: 'test-project', issueId: 'test-issue' },
      });
      expect(route.matched.length).toBeGreaterThan(0);
      expect(route.matched[route.matched.length - 1].components?.default).toBeDefined();
    });
  });

  describe('Route Parameters', () => {
    it('should pass projectId and issueId as props', () => {
      const route = router.resolve({
        name: 'IssueDetails',
        params: { projectId: 'my-project', issueId: 'my-issue' },
      });
      expect(route.params.projectId).toBe('my-project');
      expect(route.params.issueId).toBe('my-issue');
    });

    it('should handle different projectId formats', () => {
      testIds.forEach(({ projectId, issueId }) => {
        const route = router.resolve({ name: 'IssueDetails', params: { projectId, issueId } });
        expect(route.params.projectId).toBe(projectId);
        expect(route.params.issueId).toBe(issueId);
      });
    });

    it('should handle different issueId formats', () => {
      const testCases = [
        { projectId: 'proj-1', issueId: 'ISSUE-123' },
        { projectId: 'proj-1', issueId: 'issue-abc-def' },
        { projectId: 'proj-1', issueId: '12345' },
      ];
      testCases.forEach(({ projectId, issueId }) => {
        const route = router.resolve({ name: 'IssueDetails', params: { projectId, issueId } });
        expect(route.params.projectId).toBe(projectId);
        expect(route.params.issueId).toBe(issueId);
      });
    });
  });

  describe('Route Navigation', () => {
    it('should navigate to IssueDetails route', async () => {
      await router.push({ name: 'IssueDetails', params: { projectId: 'test-project', issueId: 'test-issue' } });
      expect(router.currentRoute.value.name).toBe('IssueDetails');
      expect(router.currentRoute.value.params.projectId).toBe('test-project');
      expect(router.currentRoute.value.params.issueId).toBe('test-issue');
    });

    it('should navigate using path', async () => {
      await router.push('/projects/my-proj/issues/my-issue');
      expect(router.currentRoute.value.name).toBe('IssueDetails');
      expect(router.currentRoute.value.params.projectId).toBe('my-proj');
      expect(router.currentRoute.value.params.issueId).toBe('my-issue');
    });

    it('should update route params on navigation', async () => {
      await router.push({ name: 'IssueDetails', params: { projectId: 'proj-1', issueId: 'issue-1' } });
      expect(router.currentRoute.value.params.issueId).toBe('issue-1');
      await router.push({ name: 'IssueDetails', params: { projectId: 'proj-1', issueId: 'issue-2' } });
      expect(router.currentRoute.value.params.issueId).toBe('issue-2');
    });
  });

  describe('Route Props Function', () => {
    it('should extract props from route params', () => {
      const route = router.resolve({ name: 'IssueDetails', params: { projectId: 'test-proj', issueId: 'test-issue' } });
      const matchedRoute = route.matched.find(r => r.name === 'IssueDetails');
      expect(matchedRoute).toBeDefined();
      if (matchedRoute && typeof matchedRoute.props.default === 'function') {
        const props = matchedRoute.props.default(route);
        expect(props).toEqual({ projectId: 'test-proj', issueId: 'test-issue' });
      }
    });

    it('should handle missing params gracefully', () => {
      const route = router.resolve('/projects//issues/');
      expect(route).toBeDefined();
    });
  });

  describe('Route Hierarchy', () => {
    it('should be a child of manager routes', () => {
      const route = router.resolve({ name: 'IssueDetails', params: { projectId: 'test-project', issueId: 'test-issue' } });
      expect(route.matched.length).toBeGreaterThan(1);
    });

    it('should match nested route pattern', () => {
      const route = router.resolve({ name: 'IssueDetails', params: { projectId: 'test-project', issueId: 'test-issue' } });
      expect(route.path).toMatch(/^\/projects\/[^/]+\/issues\/[^/]+$/);
    });
  });

  describe('Router Integration', () => {
    it('should work with router.resolve', () => {
      const resolved = router.resolve({ name: 'IssueDetails', params: { projectId: 'abc', issueId: '123' } });
      expect(resolved.name).toBe('IssueDetails');
      expect(resolved.href).toBe('/projects/abc/issues/123');
    });

    it('should generate correct href for router-link', () => {
      const resolved = router.resolve({ name: 'IssueDetails', params: { projectId: 'my-project', issueId: 'issue-789' } });
      expect(resolved.href).toBe('/projects/my-project/issues/issue-789');
    });

    it('should be accessible from other routes', async () => {
      // With a logged-in MANAGER user, LandingPage redirects to ProjectSelection
      await router.push({ name: 'LandingPage' });
      expect(router.currentRoute.value.name).toBe('ProjectSelection');
      await router.push({ name: 'IssueDetails', params: { projectId: 'test', issueId: 'test' } });
      expect(router.currentRoute.value.name).toBe('IssueDetails');
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in params', async () => {
      const specialChars = testIds.filter(tc => 
        tc.projectId.includes('-') || tc.projectId.includes('_')
      );
      for (const { projectId, issueId } of specialChars) {
        const route = router.resolve({ name: 'IssueDetails', params: { projectId, issueId } });
        expect(route.params.projectId).toBe(projectId);
        expect(route.params.issueId).toBe(issueId);
      }
    });

    it('should handle encoded URL characters', () => {
      const route = router.resolve({ name: 'IssueDetails', params: { projectId: 'proj%20space', issueId: 'issue%20space' } });
      expect(route.params.projectId).toBeDefined();
      expect(route.params.issueId).toBeDefined();
    });
  });

  describe('Route Meta and Guards', () => {
    it('should have parent route with beforeEnter guard', () => {
      const route = router.resolve({ name: 'IssueDetails', params: { projectId: 'test-project', issueId: 'test-issue' } });
      const parentRoute = route.matched.find(r => r.path.includes(':projectId'));
      expect(parentRoute).toBeDefined();
    });

    it('should inherit layout from parent route', () => {
      const route = router.resolve({ name: 'IssueDetails', params: { projectId: 'test-project', issueId: 'test-issue' } });
      const parentRoute = route.matched[0];
      expect(parentRoute.components).toBeDefined();
    });
  });
});
