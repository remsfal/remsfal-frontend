import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import BackToOverviewLink from '@/components/BackToOverviewLink.vue';
import { useUserSessionStore } from '@/stores/UserSession';

type SessionUser = ReturnType<typeof useUserSessionStore>['user'];

function mountAs(userContexts?: string[]) {
  useUserSessionStore().user = userContexts
    ? ({ email: 'a@b.de', userContexts } as SessionUser)
    : null;
  return mount(BackToOverviewLink).find('[data-test="back-to-overview"]');
}

describe('BackToOverviewLink', () => {
  beforeEach(() => {
    useUserSessionStore().user = null;
  });

  it('links to the landing page when logged out', () => {
    const link = mountAs();
    expect(link.attributes('href')).toBe('/');
    expect(link.text()).toBe('Zurück zur Startseite');
  });

  it('links a manager to the project selection', () => {
    const link = mountAs(['MANAGER']);
    expect(link.attributes('href')).toBe('/manager/projects');
    expect(link.text()).toBe('Zur persönlichen Übersicht');
  });

  it('links a contractor to the contractor dashboard', () => {
    const link = mountAs(['CONTRACTOR']);
    expect(link.attributes('href')).toBe('/contractor/dashboard');
    expect(link.text()).toBe('Zur persönlichen Übersicht');
  });

  it('links a tenant to the tenant dashboard', () => {
    const link = mountAs(['TENANT']);
    expect(link.attributes('href')).toBe('/tenant/dashboard');
    expect(link.text()).toBe('Zur persönlichen Übersicht');
  });

  it('renders a back icon sized like the text', () => {
    const icon = mountAs().find('i.pi-arrow-left');
    expect(icon.exists()).toBe(true);
    expect(icon.attributes('aria-hidden')).toBe('true');
  });
});
