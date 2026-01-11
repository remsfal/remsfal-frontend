import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import MobileNavBar from '../../src/components/MobileNavBar.vue';
import PrimeVue from 'primevue/config';
import Drawer from 'primevue/drawer';
import { createPinia, setActivePinia, type Pinia } from 'pinia';
import { useUserSessionStore } from '../../src/stores/UserSession';

// Mock specific components
import ManagerMenu from '../../src/layout/ManagerMenu.vue';

const mocks = vi.hoisted(() => {
  return {
    push: vi.fn(),
    route: {
      name: 'ProjectDashboard', // Default Route
      path: '/projects/test-project-id-123/dashboard',
      params: { projectId: 'test-project-id-123' },
      query: {} as Record<string, string>
    }
  };
});

vi.mock('vue-router', () => ({
  useRoute: () => mocks.route,
  useRouter: () => ({ push: mocks.push }),
  RouterLink: {
    name: 'RouterLink',
    template: '<a><slot /></a>',
    props: ['to']
  }
}));

// Mock child menus using the same alias as the source code to ensure interception
vi.mock('@/layout/ManagerMenu.vue', () => ({
  default: {
    name: 'ManagerMenu',
    template: '<div data-test="manager-menu"></div>'
  }
}));
vi.mock('@/layout/AppMenuItem.vue', () => ({
  default: {
    name: 'AppMenuItem',
    template: '<div data-test="app-menu-item"></div>',
    props: ['item']
  }
}));

describe('MobileNavBar.vue', () => {
  let wrapper: VueWrapper;
  let testPinia: Pinia;

  beforeEach(() => {
    testPinia = createPinia();
    setActivePinia(testPinia);
    mocks.route.name = 'ProjectDashboard';
    mocks.route.query = {};
    vi.clearAllMocks();
  });

  const createWrapper = () => {
    return mount(MobileNavBar, {
      global: {
        plugins: [PrimeVue, testPinia],
        components: { ManagerMenu },
        stubs: {
          FontAwesomeIcon: true,
          Drawer: { template: '<div><slot /></div>', props: ['visible'] }
        }
      }
    });
  };

  const setRole = (role: 'MANAGER' | 'CONTRACTOR' | 'TENANT') => {
    const store = useUserSessionStore();
    // Use unknown cast to avoid mocking full User object for tests
    store.user = { userRoles: [role] } as unknown as NonNullable<typeof store.user>;
  };

  it('renders exactly 4 visible navigation items for Manager by default', () => {
    setRole('MANAGER');
    wrapper = createWrapper();
    const links = wrapper.findAllComponents({ name: 'RouterLink' });
    expect(links.length).toBe(4);
  });


  it('sets "active" class correctly for Dashboard', async () => {
    setRole('MANAGER');
    mocks.route.name = 'ProjectDashboard';
    wrapper = createWrapper();

    const links = wrapper.findAllComponents({ name: 'RouterLink' });
    expect(links[0].classes()).toContain('active');
    expect(links[1].classes()).not.toContain('active');
  });

  it('highlights "Aufgaben" (Tasks) based on query params', async () => {
    setRole('MANAGER');
    mocks.route.name = 'IssueOverview';
    mocks.route.query = { status: 'OPEN', category: 'TASK' };

    wrapper = createWrapper();
    const links = wrapper.findAllComponents({ name: 'RouterLink' });

    expect(links[1].classes()).toContain('active');
    expect(links[2].classes()).not.toContain('active');
  });

  it('highlights "Mängel" (Defects) based on query params', async () => {
    setRole('MANAGER');

    mocks.route.name = 'IssueOverview';
    mocks.route.query = { status: 'OPEN', category: 'DEFECT' };

    wrapper = createWrapper();
    const links = wrapper.findAllComponents({ name: 'RouterLink' });

    expect(links[1].classes()).not.toContain('active');
    expect(links[2].classes()).toContain('active');
  });

  it('shows the "More" button, handles click and opens Drawer', async () => {
    setRole('MANAGER');
    wrapper = createWrapper();

    const moreBtn = wrapper.find('.more-btn');
    expect(moreBtn.exists()).toBe(true);

    // Check drawer is initially hidden (or at least visible prop is false)
    const drawer = wrapper.findComponent(Drawer);
    expect(drawer.exists()).toBe(true);
    expect(drawer.props('visible')).toBe(false);

    await moreBtn.trigger('click');
    expect(drawer.props('visible')).toBe(true);
  });

  it('renders ManagerMenu inside Drawer when role is MANAGER', async () => {
    setRole('MANAGER');
    wrapper = createWrapper();

    // Open drawer to trigger rendering if v-if is used (though components often render but hidden)
    // Here we check if the component exists in the wrapper
    const managerMenu = wrapper.find('[data-test="manager-menu"]');
    expect(managerMenu.exists()).toBe(true);

    // Should not render AppMenuItem loop for Contractor
    const appMenuItems = wrapper.findAll('[data-test="app-menu-item"]');
    expect(appMenuItems.length).toBe(0);
  });

  it('renders local Contractor menu (AppMenuItems) inside Drawer when role is CONTRACTOR', async () => {
    setRole('CONTRACTOR');
    wrapper = createWrapper();

    // Check for AppMenuItems instead of ContractorMenu component
    const appMenuItems = wrapper.findAll('[data-test="app-menu-item"]');
    expect(appMenuItems.length).toBeGreaterThan(0);

    const managerMenu = wrapper.find('[data-test="manager-menu"]');
    expect(managerMenu.exists()).toBe(false);
  });

  it('generates correct link for "Mängel" with query params', () => {
    setRole('MANAGER');
    wrapper = createWrapper();
    const links = wrapper.findAllComponents({ name: 'RouterLink' });
    const defectLink = links[2];

    expect(defectLink.props('to')).toEqual({
      name: 'IssueOverview',
      params: { projectId: 'test-project-id-123' },
      query: { status: 'OPEN', category: 'DEFECT' }
    });
  });

  it('generates correct link for "Aufgaben" with query params', () => {
    setRole('MANAGER');
    wrapper = createWrapper();
    const links = wrapper.findAllComponents({ name: 'RouterLink' });
    const taskLink = links[1];

    expect(taskLink.props('to')).toEqual({
      name: 'IssueOverview',
      params: { projectId: 'test-project-id-123' },
      query: { status: 'OPEN', category: 'TASK' }
    });
  });

  it('renders correct items for Tenant role', () => {
    setRole('TENANT');
    wrapper = createWrapper();

    // Tenant has 2 items: Overview, Messages. Plus "More" button (not a RouterLink)
    const links = wrapper.findAllComponents({ name: 'RouterLink' });
    expect(links.length).toBe(2);

    // Verify Drawer contains local AppMenuItems for Tenant
    const appMenuItems = wrapper.findAll('[data-test="app-menu-item"]');
    expect(appMenuItems.length).toBeGreaterThan(0);

    // Ensure ManagerMenu is not present
    expect(wrapper.find('[data-test="manager-menu"]').exists()).toBe(false);
  });

  it('renders general menu items when no projectId is present', () => {
    setRole('MANAGER');
    mocks.route.params = { projectId: '' }; // No project ID
    wrapper = createWrapper();

    const links = wrapper.findAllComponents({ name: 'RouterLink' });
    expect(links.length).toBe(2); // "Projekte", "Einstellungen"
    expect(links[0].props('to')).toEqual({ name: 'ProjectSelection' });
  });

  it('activates Contractor links correctly using named routes and query params', async () => {
    setRole('CONTRACTOR');
    // Scenario 1: Overview (No Query)
    mocks.route.name = 'ContractorView';
    mocks.route.path = '/customers';
    mocks.route.query = {};

    wrapper = createWrapper();
    let links = wrapper.findAllComponents({ name: 'RouterLink' });

    expect(links.length).toBe(2);
    expect(links[0].classes()).toContain('active'); // Overview (should be active)
    expect(links[1].classes()).not.toContain('active'); // Orders (should be inactive)

    // Scenario 2: Orders (With Query)
    mocks.route.query = { tab: 'orders' };

    // Remount to trigger computed properties with new mock state
    wrapper = createWrapper();
    links = wrapper.findAllComponents({ name: 'RouterLink' });

    expect(links[0].classes()).not.toContain('active'); // Overview (should be inactive due to strict check)
    expect(links[1].classes()).toContain('active'); // Orders (should be active)
  });

  it('renders correct icon class for string icons', () => {
    setRole('CONTRACTOR');
    wrapper = createWrapper();

    // Contractor items use string icons like 'pi-home'
    const html = wrapper.html();
    expect(html).toContain('pi-home');
  });

  it('closes sidebar and resets layout state on window resize > 991px', async () => {
    wrapper = createWrapper();
    // Initially open sidebar
    const moreBtn = wrapper.find('.more-btn');
    await moreBtn.trigger('click');
    expect(wrapper.findComponent(Drawer).props('visible')).toBe(true);

    // Simulate resize
    globalThis.innerWidth = 1024;
    globalThis.dispatchEvent(new Event('resize'));
    await wrapper.vm.$nextTick();

    // Sidebar should be closed
    expect(wrapper.findComponent(Drawer).props('visible')).toBe(false);
  });

  it('isActive correctly handles object targets with name checking', () => {
    setRole('CONTRACTOR');
    wrapper = createWrapper();

    // Simulate complex Route location objects
    const vm = wrapper.vm as unknown as { isActive: (item: any) => boolean };

    // Mock current route
    mocks.route.name = 'TestRoute';
    mocks.route.query = {};

    // 1. Mismatch name
    expect(vm.isActive({ to: { name: 'OtherRoute' } })).toBe(false);

    // 2. Match name, no query
    expect(vm.isActive({ to: { name: 'TestRoute' } })).toBe(true);

    // 3. Match name, match query
    mocks.route.query = { id: '1' };
    expect(vm.isActive({ to: { name: 'TestRoute', query: { id: '1' } } })).toBe(true);

    // 4. Match name, mismatch query value
    expect(vm.isActive({ to: { name: 'TestRoute', query: { id: '2' } } })).toBe(false);

    // 5. Match name, missing query key in route
    mocks.route.query = {};
    expect(vm.isActive({ to: { name: 'TestRoute', query: { id: '1' } } })).toBe(false);
  });

  it('local menu items have command to close sidebar', () => {
    setRole('CONTRACTOR');
    wrapper = createWrapper();
    const vm = wrapper.vm as unknown as { sidebarVisible: boolean };

    // Access the internal model
    // Note: contractorMenuModel is local state in setup. 
    // We can access it if we returned it, but <script setup> makes it closed by default.
    // However, we pass it to AppMenuItem props.
    // Let's find the AppMenuItems and check their props.

    const appMenuItems = wrapper.findAllComponents({ name: 'AppMenuItem' });
    expect(appMenuItems.length).toBeGreaterThan(0);

    const firstItem = appMenuItems[0].props('item'); // Top level item (category)
    // The model is nested: Category -> Items.
    // AppMenuItem implementation might be recursive or flat loop.
    // In template: v-for="item in contractorMenuModel" => AppMenuItem :item="item"
    // So the prop 'item' is the Category object.

    expect(firstItem.items).toBeDefined();
    expect(firstItem.items.length).toBeGreaterThan(0);

    // Check the actual link item
    const linkItem = firstItem.items[0];
    expect(linkItem.command).toBeDefined();

    // Execute command and verify sidebar closes
    // We need to set sidebar visible first
    vm.sidebarVisible = true;
    linkItem.command();
    expect(vm.sidebarVisible).toBe(false);
  });
});