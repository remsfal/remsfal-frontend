import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import MobileNavBar from '../../src/components/MobileNavBar.vue';
import PrimeVue from 'primevue/config';
import Menu from 'primevue/menu';


const mocks = vi.hoisted(() => {
  return {
    push: vi.fn(),
    route: {
      name: 'ProjectDashboard', // Default Route
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

describe('MobileNavBar.vue', () => {
  let wrapper: VueWrapper;

  const createWrapper = () => {
    return mount(MobileNavBar, {
      global: {
        plugins: [PrimeVue],
        stubs: { RouterLink: true }
      }
    });
  };

  beforeEach(() => {
    mocks.route.name = 'ProjectDashboard';
    mocks.route.query = {};
    vi.clearAllMocks();
  });

  it('renders exactly 4 visible navigation items', () => {
    wrapper = createWrapper();
    const links = wrapper.findAllComponents({ name: 'RouterLink' });
    expect(links.length).toBe(4);
  });


  it('sets "active" class correctly for Dashboard', async () => {
    mocks.route.name = 'ProjectDashboard';
    wrapper = createWrapper();

    const links = wrapper.findAllComponents({ name: 'RouterLink' });
    expect(links[0].classes()).toContain('active');
    expect(links[1].classes()).not.toContain('active');
  });

  it('highlights "Aufgaben" (Tasks) based on query params', async () => {
    mocks.route.name = 'IssueOverview';
    mocks.route.query = { status: 'OPEN', category: 'TASK' };

    wrapper = createWrapper();
    const links = wrapper.findAllComponents({ name: 'RouterLink' });

    expect(links[1].classes()).toContain('active');

    expect(links[2].classes()).not.toContain('active');
  });

  it('highlights "Mängel" (Defects) based on query params', async () => {

    mocks.route.name = 'IssueOverview';
    mocks.route.query = { status: 'OPEN', category: 'DEFECT' };

    wrapper = createWrapper();
    const links = wrapper.findAllComponents({ name: 'RouterLink' });

    expect(links[1].classes()).not.toContain('active');

    expect(links[2].classes()).toContain('active');
  });



  it('shows the "More" button, handles click and validates hidden items', async () => {
    wrapper = createWrapper();

    const moreBtn = wrapper.find('.more-btn');
    expect(moreBtn.exists()).toBe(true);

    await moreBtn.trigger('click');

    const menu = wrapper.findComponent(Menu);
    expect(menu.exists()).toBe(true);

    const menuModel = menu.props('model') as { label: string; icon: string }[];
    expect(menuModel.length).toBe(3);
    expect(menuModel[0].label).toBe('Objekte');
    expect(menuModel[2].label).toBe('Chat');
  });

  it('generates correct link for "Mängel" with query params', () => {
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
    wrapper = createWrapper();
    const links = wrapper.findAllComponents({ name: 'RouterLink' });
    const taskLink = links[1];

    expect(taskLink.props('to')).toEqual({
      name: 'IssueOverview',
      params: { projectId: 'test-project-id-123' },
      query: { status: 'OPEN', category: 'TASK' }
    });
  });

  it('navigates correctly when a menu item is clicked', () => {
    wrapper = createWrapper();
    const menu = wrapper.findComponent(Menu);
    const menuModel = menu.props('model') as { label: string; command: () => void }[];

    const firstItem = menuModel[0];
    firstItem.command();

    expect(mocks.push).toHaveBeenCalledWith({
      name: 'RentableUnits',
      params: { projectId: 'test-project-id-123' }
    });
  });
});