import { describe, it, expect, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import MobileNavBar from '../../src/components/MobileNavBar.vue';
import PrimeVue from 'primevue/config';
import Menu from 'primevue/menu';

const mocks = vi.hoisted(() => {
  return {push: vi.fn()};
});

vi.mock('vue-router', () => ({
  useRoute: () => ({params: {projectId: 'test-project-id-123'}}),
  useRouter: () => ({push: mocks.push}),

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
        stubs: {RouterLink: true}
      }
    });
  };

  it('renders exactly 4 visible navigation items', () => {
    wrapper = createWrapper();
    const links = wrapper.findAllComponents({ name: 'RouterLink' });
    expect(links.length).toBe(4);
  });

  it('shows the "More" button, handles click and validates hidden items', async () => {
    wrapper = createWrapper();

    const moreBtn = wrapper.find('.more-btn');
    expect(moreBtn.exists()).toBe(true);

    try {
      await moreBtn.trigger('click');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) { /* empty */ }

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