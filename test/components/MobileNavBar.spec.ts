import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import MobileNavBar from '../../src/components/MobileNavBar.vue';
import PrimeVue from 'primevue/config';
import Drawer from 'primevue/drawer';
import { createPinia, setActivePinia } from 'pinia';
import { useUserSessionStore } from '../../src/stores/UserSession';

// Mock specific components
import ManagerMenu from '../../src/layout/ManagerMenu.vue';
import ContractorMenu from '../../src/layout/ContractorMenu.vue';
import TenantMenu from '../../src/layout/TenantMenu.vue';

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
vi.mock('@/layout/ContractorMenu.vue', () => ({
  default: {
    name: 'ContractorMenu',
    template: '<div data-test="contractor-menu"></div>'
  }
}));
vi.mock('@/layout/TenantMenu.vue', () => ({
  default: {
    name: 'TenantMenu',
    template: '<div data-test="tenant-menu"></div>'
  }
}));

describe('MobileNavBar.vue', () => {
  let wrapper: VueWrapper;
  let testPinia: any;

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
        components: {
          ManagerMenu, ContractorMenu, TenantMenu
        },
        stubs: {
          RouterLink: true,
          FontAwesomeIcon: true,
          Drawer: { template: '<div><slot /></div>', props: ['visible'] }
        }
      }
    });
  };

  it('renders exactly 4 visible navigation items for Manager by default', () => {
    const store = useUserSessionStore();
    store.user = { userRoles: ['MANAGER'] } as any; // Mock user role

    wrapper = createWrapper();
    const links = wrapper.findAllComponents({ name: 'RouterLink' });
    expect(links.length).toBe(4);
  });


  it('sets "active" class correctly for Dashboard', async () => {
    const store = useUserSessionStore();
    store.user = { userRoles: ['MANAGER'] } as any;
    mocks.route.name = 'ProjectDashboard';
    wrapper = createWrapper();

    const links = wrapper.findAllComponents({ name: 'RouterLink' });
    expect(links[0].classes()).toContain('active');
    expect(links[1].classes()).not.toContain('active');
  });

  it('highlights "Aufgaben" (Tasks) based on query params', async () => {
    const store = useUserSessionStore();
    store.user = { userRoles: ['MANAGER'] } as any;
    mocks.route.name = 'IssueOverview';
    mocks.route.query = { status: 'OPEN', category: 'TASK' };

    wrapper = createWrapper();
    const links = wrapper.findAllComponents({ name: 'RouterLink' });

    expect(links[1].classes()).toContain('active');
    expect(links[2].classes()).not.toContain('active');
  });

  it('highlights "Mängel" (Defects) based on query params', async () => {
    const store = useUserSessionStore();
    store.user = { userRoles: ['MANAGER'] } as any;

    mocks.route.name = 'IssueOverview';
    mocks.route.query = { status: 'OPEN', category: 'DEFECT' };

    wrapper = createWrapper();
    const links = wrapper.findAllComponents({ name: 'RouterLink' });

    expect(links[1].classes()).not.toContain('active');
    expect(links[2].classes()).toContain('active');
  });

  it('shows the "More" button, handles click and opens Drawer', async () => {
    const store = useUserSessionStore();
    store.user = { userRoles: ['MANAGER'] } as any;
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
    const store = useUserSessionStore();
    store.user = { userRoles: ['MANAGER'] } as any;
    wrapper = createWrapper();

    // Open drawer to trigger rendering if v-if is used (though components often render but hidden)
    // Here we check if the component exists in the wrapper
    const managerMenu = wrapper.find('[data-test="manager-menu"]');
    expect(managerMenu.exists()).toBe(true);

    const contractorMenu = wrapper.find('[data-test="contractor-menu"]');
    expect(contractorMenu.exists()).toBe(false);
  });

  it('renders ContractorMenu inside Drawer when role is CONTRACTOR', async () => {
    const store = useUserSessionStore();
    store.user = { userRoles: ['CONTRACTOR'] } as any;
    wrapper = createWrapper();

    // Contractor items might be different, but we check the Drawer content
    const contractorMenu = wrapper.find('[data-test="contractor-menu"]');
    expect(contractorMenu.exists()).toBe(true);

    const managerMenu = wrapper.find('[data-test="manager-menu"]');
    expect(managerMenu.exists()).toBe(false);
  });

  it('generates correct link for "Mängel" with query params', () => {
    const store = useUserSessionStore();
    store.user = { userRoles: ['MANAGER'] } as any;
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
    const store = useUserSessionStore();
    store.user = { userRoles: ['MANAGER'] } as any;
    wrapper = createWrapper();
    const links = wrapper.findAllComponents({ name: 'RouterLink' });
    const taskLink = links[1];

    expect(taskLink.props('to')).toEqual({
      name: 'IssueOverview',
      params: { projectId: 'test-project-id-123' },
      query: { status: 'OPEN', category: 'TASK' }
    });
  });
});