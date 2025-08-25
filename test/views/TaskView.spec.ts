import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import TaskView from '../../src/views/TaskView.vue';
import { TaskService, StatusValues, TaskItem } from '../../src/services/TaskService';

describe('TaskView', () => {
  let wrapper: VueWrapper<InstanceType<typeof TaskView>>;
  const projectId: string = '1';
  const owner: string = 'user1';

  // Mock data
  const mockTasks: TaskItem[] = [
    {
      id: '1',
      title: 'Task 1',
      status: StatusValues.OPEN,
      ownerId: 'owner1',
      reporterId: 'reporter1'
    },
    {
      id: '2',
      title: 'Task 2',
      status: StatusValues.OPEN,
      ownerId: 'owner1',
      reporterId: 'reporter1'
    },
  ];

  beforeEach(() => {
    // Mock TaskService.getTasks to always return mockTasks
    vi.spyOn(TaskService.prototype, 'getTasks').mockResolvedValue({ tasks: mockTasks });

    wrapper = mount(TaskView, {
      props: { projectId, owner },
      data() {
        return { visible: false }; // initial state
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
      expect((wrapper.vm.$data as { visible: boolean }).visible).toBe(true);
    });
    
  });

  describe('Header rendering', () => {
    it('renders "Meine Aufgaben" when owner prop is defined', () => {
      const header = wrapper.find('h2');
      expect(header.text()).toBe('Meine Aufgaben');
    });

    it('renders "Offene Aufgaben" when status prop is defined and owner is null', async () => {
      await wrapper.setProps({ owner: undefined, status: StatusValues.OPEN });
      await wrapper.vm.$nextTick();
      const header = wrapper.find('h2');
      expect(header.text()).toBe('Offene Aufgaben');
    });

    it('renders "Alle Aufgaben" when neither owner nor status is defined', async () => {
      await wrapper.setProps({ owner: undefined, status: undefined });
      await wrapper.vm.$nextTick();
      const header = wrapper.find('h2');
      expect(header.text()).toBe('Alle Aufgaben');
    });
  });

  describe('Task fetching', () => {
    it('loads and displays tasks from the service', async () => {
      await wrapper.vm.$nextTick();
      const tableWrapper = wrapper.findComponent({ name: 'TaskTable' });
      expect(tableWrapper.exists()).toBe(true);

      const tasksProp = tableWrapper.props('tasks') as TaskItem[];
      expect(tasksProp).toHaveLength(2);
      expect(tasksProp[0].title).toBe('Task 1');
      expect(tasksProp[1].title).toBe('Task 2');
    });
  });
});
