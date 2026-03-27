import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper, flushPromises } from '@vue/test-utils';
import ProjectMenu from '@/layouts/components/ProjectMenu.vue';
import { useProjectStore } from '@/stores/ProjectStore';
import { useUserSessionStore } from '@/stores/UserSession';

// Suppress console.log from ProjectMenu (watches projectId changes)
vi.spyOn(console, 'log').mockImplementation(() => {});

describe('ProjectMenu.vue', () => {
  let wrapper: VueWrapper;
  let projectStore: ReturnType<typeof useProjectStore>;
  let sessionStore: ReturnType<typeof useUserSessionStore>;

  const mountMenu = () => mount(ProjectMenu);

  beforeEach(() => {
    projectStore = useProjectStore();
    sessionStore = useUserSessionStore();
    projectStore.projectId = undefined;
    sessionStore.user = null;
  });

  it('renders the sidebar container', () => {
    wrapper = mountMenu();
    expect(wrapper.find('.layout-sidebar').exists()).toBe(true);
    expect(wrapper.find('.layout-menu').exists()).toBe(true);
  });

  it('renders four root menu sections', async () => {
    wrapper = mountMenu();
    await wrapper.vm.$nextTick();
    const rootItems = wrapper.findAll('.layout-root-menuitem');
    expect(rootItems.length).toBe(4);
  });

  it('renders section labels', async () => {
    wrapper = mountMenu();
    await wrapper.vm.$nextTick();
    const rootItems = wrapper.findAll('.layout-root-menuitem');
    expect(rootItems[0].text()).toContain('Home');
    expect(rootItems[1].text()).toContain('Stammdaten');
    expect(rootItems[2].text()).toContain('Aufgabenmanagement');
    expect(rootItems[3].text()).toContain('Mängelmanagement');
  });

  it('uses "/" as fallback route when no projectId is set', async () => {
    projectStore.projectId = undefined;
    wrapper = mountMenu();
    await wrapper.vm.$nextTick();

    // All links should fall back to '/' since there is no projectId
    const links = wrapper.findAll('a[href="/"]');
    expect(links.length).toBeGreaterThan(0);
  });

  it('builds routes with projectId when projectId is set', async () => {
    projectStore.projectId = 'proj-123';
    wrapper = mountMenu();
    await wrapper.vm.$nextTick();

    const html = wrapper.html();
    expect(html).toContain('/projects/proj-123/dashboard');
    expect(html).toContain('/projects/proj-123/units');
    expect(html).toContain('/projects/proj-123/agreements');
  });

  it('includes user id in issues URL when user is set', async () => {
    projectStore.projectId = 'proj-123';
    sessionStore.user = { id: 'user-42', email: 'manager@example.com' } as ReturnType<typeof useUserSessionStore>['user'];
    wrapper = mountMenu();
    await wrapper.vm.$nextTick();

    expect(wrapper.html()).toContain('/projects/proj-123/issues?owner=user-42');
  });

  it('updates menu routes when projectId changes', async () => {
    projectStore.projectId = undefined;
    wrapper = mountMenu();
    await wrapper.vm.$nextTick();

    // Initially all links are '/'
    expect(wrapper.html()).not.toContain('/projects/proj-456/dashboard');

    // Change projectId
    projectStore.projectId = 'proj-456';
    await flushPromises();

    expect(wrapper.html()).toContain('/projects/proj-456/dashboard');
  });

  it('renders submenu items for Home section', async () => {
    wrapper = mountMenu();
    await wrapper.vm.$nextTick();
    const labels = wrapper.findAll('.layout-submenu .layout-menuitem-text').map(el => el.text());
    expect(labels).toContain('Dashboard');
    expect(labels).toContain('Einstellungen');
  });

  it('renders submenu items for Stammdaten section', async () => {
    wrapper = mountMenu();
    await wrapper.vm.$nextTick();
    const labels = wrapper.findAll('.layout-submenu .layout-menuitem-text').map(el => el.text());
    expect(labels).toContain('Wirtschaftseinheiten');
    expect(labels).toContain('Mietverträge');
    expect(labels).toContain('Mieter');
    expect(labels).toContain('Auftragnehmer');
  });

  it('renders submenu items for Aufgabenmanagement section', async () => {
    wrapper = mountMenu();
    await wrapper.vm.$nextTick();
    const labels = wrapper.findAll('.layout-submenu .layout-menuitem-text').map(el => el.text());
    expect(labels).toContain('Meine Aufgaben');
    expect(labels).toContain('Offene Aufgaben');
    expect(labels).toContain('Alle Aufgaben');
  });
});
