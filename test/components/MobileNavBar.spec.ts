import { describe, it, expect, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import MobileNavBar from '../../src/components/MobileNavBar.vue'; // Pfad wie in deinem Snippet
import PrimeVue from 'primevue/config';
import Menu from 'primevue/menu';


const mocks = vi.hoisted(() => {
  return {
    push: vi.fn()
  };
});

vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: {
      projectId: 'test-project-id-123'
    }
  }),
  useRouter: () => ({
    push: mocks.push
  }),

  RouterLink: {
    name: 'RouterLink',
    template: '<a><slot /></a>',
    props: ['to']
  }
}));

describe('MobileNavBar.vue', () => {
  let wrapper: VueWrapper;

  // Helper Funktion
  const createWrapper = () => {
    return mount(MobileNavBar, {
      global: {
        plugins: [PrimeVue],
        stubs: {
          RouterLink: true
        }
      }
    });
  };

  it('renders exactly 4 visible navigation items', () => {
    wrapper = createWrapper();
    const links = wrapper.findAllComponents({ name: 'RouterLink' });
    expect(links.length).toBe(4);
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

  it('shows the "More" button and hides extra items in the Menu', () => {
    wrapper = createWrapper();

    const moreBtn = wrapper.find('.more-btn');
    expect(moreBtn.exists()).toBe(true);

    const menu = wrapper.findComponent(Menu);
    expect(menu.exists()).toBe(true);

    const menuModel: any[] = menu.props('model');
    expect(menuModel.length).toBe(3);
    expect(menuModel[0].label).toBe('Objekte');
    expect(menuModel[2].label).toBe('Chat');
  });

  it('navigates correctly when a menu item is clicked', () => {
    wrapper = createWrapper();
    const menu = wrapper.findComponent(Menu);
    const menuModel: any[] = menu.props('model');


    const firstItem = menuModel[0];
    firstItem.command();


    expect(mocks.push).toHaveBeenCalledWith({
      name: 'RentableUnits',
      params: { projectId: 'test-project-id-123' }
    });
  });
});