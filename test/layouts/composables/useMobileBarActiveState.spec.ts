import { describe, it, expect } from 'vitest';
import { mount, config } from '@vue/test-utils';
import { defineComponent, reactive } from 'vue';
import { routeLocationKey } from 'vue-router';
import router from '@/router';
import { useMobileBarActiveState, type MobileNavItem } from '@/layouts/composables/useMobileBarActiveState';

// Remove real router so our routeLocationKey provide takes effect in useRoute()
config.global.plugins = config.global.plugins.filter((p) => p !== router);

/**
 * Helper: mounts a tiny component that calls useMobileBarActiveState()
 * and returns the result of isActive(item) for the given route.
 */
function callIsActive(route: object, item: MobileNavItem): boolean {
  let result = false;

  const TestComponent = defineComponent({
    setup() {
      const { isActive } = useMobileBarActiveState();
      result = isActive(item);
      return {};
    },
    template: '<div></div>',
  });

  mount(TestComponent, {global: {provide: { [routeLocationKey as symbol]: reactive(route) },},});

  return result;
}

const makeItem = (to: MobileNavItem['to']): MobileNavItem => ({
  label: 'test',
  to,
  icon: 'pi pi-home',
});

describe('useMobileBarActiveState', () => {
  describe('named route matching', () => {
    it('returns true when route.name matches named route object', () => {
      const result = callIsActive(
        { path: '/manager/projects', name: 'ProjectSelection' },
        makeItem({ name: 'ProjectSelection' }),
      );
      expect(result).toBe(true);
    });

    it('returns false when route.name does not match', () => {
      const result = callIsActive(
        { path: '/manager/projects', name: 'OtherRoute' },
        makeItem({ name: 'ProjectSelection' }),
      );
      expect(result).toBe(false);
    });

    it('returns false when route.name is undefined', () => {
      const result = callIsActive(
        { path: '/manager/projects', name: undefined },
        makeItem({ name: 'ProjectSelection' }),
      );
      expect(result).toBe(false);
    });
  });

  describe('string path matching', () => {
    it('returns true on exact path match', () => {
      const result = callIsActive(
        { path: '/tenancies/dashboard', name: 'TenantDashboard' },
        makeItem('/tenancies/dashboard'),
      );
      expect(result).toBe(true);
    });

    it('returns true when route path starts with item path', () => {
      const result = callIsActive(
        { path: '/tenancies/dashboard/sub', name: 'TenantSub' },
        makeItem('/tenancies/dashboard'),
      );
      expect(result).toBe(true);
    });

    it('returns false when path does not match', () => {
      const result = callIsActive(
        { path: '/manager/projects', name: 'ProjectSelection' },
        makeItem('/tenancies/dashboard'),
      );
      expect(result).toBe(false);
    });

    it('does not match "/" to avoid marking everything as active', () => {
      const result = callIsActive(
        { path: '/tenancies/dashboard', name: 'TenantDashboard' },
        makeItem('/'),
      );
      expect(result).toBe(false);
    });

    it('returns false when to is an empty string', () => {
      const result = callIsActive(
        { path: '/some/path', name: 'SomePage' },
        makeItem(''),
      );
      expect(result).toBe(false);
    });
  });
});
