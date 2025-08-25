import { describe, it, expect, beforeEach, beforeAll, afterAll, afterEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import TaskView from '../../src/views/TaskView.vue';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { StatusValues } from '../../src/services/TaskService';

// --- MSW server setup ---
const API_BASE = '/api/v1';

const server = setupServer(
  // GET tasks handler
  http.get(`${API_BASE}/projects/:projectId/tasks`, ({ request }) => {
    const url = new URL(request.url, 'http://localhost');
    const owner = url.searchParams.get('owner');

    return HttpResponse.json({
      tasks: [
        {
          id: '1',
          title: 'Task 1',
          name: 'task1',
          status: StatusValues.OPEN,
          owner: owner ?? 'user1',
        },
        {
          id: '2',
          title: 'Task 2',
          name: 'task2',
          status: StatusValues.OPEN,
          owner: owner ?? 'user1',
        },
      ],
    });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// --- Test suite ---
describe('TaskView', () => {
  let wrapper: VueWrapper<any>;
  const projectId = '1';
  const owner = 'user1';

  beforeEach(() => {
    wrapper = mount(TaskView, {
      props: { projectId, owner },
      data() {
        return { visible: false };
      },
    });
  });

  describe('Button rendering and interaction', () => {
    it('renders the "Aufgabe erstellen" button when owner is defined', () => {
      const button = wrapper.find('.my-btn');
      expect(button.exists()).toBe(true);
      expect(button.text()).toBe('Aufgabe erstellen');
    });

    it('sets "visible" to true when the button is clicked', async () => {
      const button = wrapper.find('.my-btn');
      await button.trigger('click');
      expect(wrapper.vm.visible).toBe(true);
    });
  });

  describe('Header rendering', () => {
    it('renders "Meine Aufgaben" when owner prop is defined', () => {
      const header = wrapper.find('h2');
      expect(header.text()).toBe('Meine Aufgaben');
    });

    it('renders "Offene Aufgaben" when status prop is defined and owner is null', async () => {
      await wrapper.setProps({ owner: null, status: StatusValues.OPEN });
      const header = wrapper.find('h2');
      expect(header.text()).toBe('Offene Aufgaben');
    });

    it('renders "Alle Aufgaben" when neither owner nor status is defined', async () => {
      await wrapper.setProps({ owner: null, status: null });
      const header = wrapper.find('h2');
      expect(header.text()).toBe('Alle Aufgaben');
    });
  });

  describe('Task fetching via MSW', () => {
    it('loads and displays tasks from the API', async () => {
      await wrapper.vm.$nextTick();
      await new Promise(resolve => setTimeout(resolve, 50));

      const taskEls = wrapper.findAll('li');
      expect(taskEls.length).toBe(2);
      expect(taskEls[0].text()).toContain('Task 1');
      expect(taskEls[1].text()).toContain('Task 2');
    });
  });
});
