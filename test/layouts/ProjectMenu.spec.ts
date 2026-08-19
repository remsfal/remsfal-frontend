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

  // Finds the rendered <a>/RouterLink for a submenu item by its visible label text.
  const findLinkByLabel = (label: string) => {
    const textEl = wrapper
      .findAll('.layout-submenu .layout-menuitem-text')
      .find((el) => el.text() === label);
    return textEl?.element.closest('a');
  };

  beforeEach(() => {
    projectStore = useProjectStore();
    sessionStore = useUserSessionStore();
    projectStore.selectedProject = undefined;
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
    expect(rootItems).toHaveLength(4);
  });

  it('renders section labels', async () => {
    wrapper = mountMenu();
    await wrapper.vm.$nextTick();
    const rootItems = wrapper.findAll('.layout-root-menuitem');
    expect(rootItems[0].text()).toContain('Home');
    expect(rootItems[1].text()).toContain('Stammdaten');
    expect(rootItems[2].text()).toContain('Aufgabenmanagement');
    expect(rootItems[3].text()).toContain('Mieterkommunikation');
  });

  it('uses "/" as fallback route when no projectId is set', async () => {
    projectStore.selectedProject = undefined;
    wrapper = mountMenu();
    await wrapper.vm.$nextTick();

    // All links should fall back to '/' since there is no projectId
    const links = wrapper.findAll('a[href="/"]');
    expect(links.length).toBeGreaterThan(0);
  });

  it('builds routes with projectId when projectId is set', async () => {
    projectStore.selectedProject = {
      id: 'proj-123', name: 'Test Project', memberRole: 'MANAGER' 
    };
    wrapper = mountMenu();
    await wrapper.vm.$nextTick();

    const html = wrapper.html();
    expect(html).toContain('/projects/proj-123/dashboard');
    expect(html).toContain('/projects/proj-123/units');
    expect(html).toContain('/projects/proj-123/agreements');
  });

  it('includes user id in issues URL when user is set, without a type filter', async () => {
    projectStore.selectedProject = {
      id: 'proj-123', name: 'Test Project', memberRole: 'MANAGER'
    };
    sessionStore.user = { id: 'user-42', email: 'manager@example.com' } as ReturnType<typeof useUserSessionStore>['user'];
    wrapper = mountMenu();
    await wrapper.vm.$nextTick();

    const href = findLinkByLabel('Meine Aufgaben')?.getAttribute('href');
    expect(href).toContain('/projects/proj-123/issues');
    expect(href).toContain('assigneeId=user-42');
    expect(href).not.toContain('type=');
  });

  it('wires "Offene Aufgaben" to multiple statuses without a type filter', async () => {
    projectStore.selectedProject = {
      id: 'proj-123', name: 'Test Project', memberRole: 'MANAGER'
    };
    wrapper = mountMenu();
    await wrapper.vm.$nextTick();

    const href = findLinkByLabel('Offene Aufgaben')?.getAttribute('href');
    expect(href).toContain('status=OPEN');
    expect(href).toContain('status=IN_PROGRESS');
    expect(href).not.toContain('type=');
  });

  it('wires Mieterkommunikation items to the issues view instead of chat', async () => {
    projectStore.selectedProject = {
      id: 'proj-123', name: 'Test Project', memberRole: 'MANAGER'
    };
    wrapper = mountMenu();
    await wrapper.vm.$nextTick();

    const html = wrapper.html();
    expect(html).not.toContain('/projects/proj-123/chat');

    const href = findLinkByLabel('Offene Mängel')?.getAttribute('href');
    expect(href).toContain('type=DEFECT');
    expect(href).toContain('status=OPEN');
    expect(href).toContain('status=IN_PROGRESS');
  });

  it('wires "Offene Vorgänge" to the open statuses and request-type set', async () => {
    projectStore.selectedProject = {
      id: 'proj-123', name: 'Test Project', memberRole: 'MANAGER'
    };
    wrapper = mountMenu();
    await wrapper.vm.$nextTick();

    const href = findLinkByLabel('Offene Vorgänge')?.getAttribute('href');
    expect(href).toContain('status=OPEN');
    expect(href).toContain('status=IN_PROGRESS');
    expect(href).toContain('type=APPLICATION');
    expect(href).toContain('type=INQUIRY');
    expect(href).toContain('type=TASK');
    expect(href).toContain('type=TERMINATION');
  });

  it('updates menu routes when projectId changes', async () => {
    projectStore.selectedProject = undefined;
    wrapper = mountMenu();
    await wrapper.vm.$nextTick();

    // Initially all links are '/'
    expect(wrapper.html()).not.toContain('/projects/proj-456/dashboard');

    // Change projectId
    projectStore.selectedProject = {
      id: 'proj-456', name: 'Test Project', memberRole: 'MANAGER' 
    };
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
    expect(labels).toContain('Mietverhältnisse');
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

  it('renders submenu items for Mieterkommunikation section', async () => {
    wrapper = mountMenu();
    await wrapper.vm.$nextTick();
    const labels = wrapper.findAll('.layout-submenu .layout-menuitem-text').map(el => el.text());
    expect(labels).toContain('Neue Meldungen');
    expect(labels).toContain('Offene Mängel');
    expect(labels).toContain('Offene Vorgänge');
  });
});
