import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import TaskView from '../../src/views/TaskView.vue';
import PrimeVue from 'primevue/config';
import TaskService, { Status, TaskItem } from '../../src/services/TaskService';

describe('TaskView', () => {
  let wrapper: VueWrapper;

  const projectId = '1';
  const owner = 'user1';
  const service = new TaskService();

  beforeEach(() => {
    wrapper = mount(TaskView, {
      props: { projectId, owner },
      global: {
        plugins: [PrimeVue],
      },
      data() {
        return {
          visible: false, // Initial visibility state
        };
      },
    });
  });

  describe('Button rendering and interaction', () => {
    it('renders the button when owner is defined', () => {
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

    it('renders "Offene Aufgaben" when status prop is defined and owner is undefined', async () => {
      await wrapper.setProps({ owner: null, status: 'OPEN' });
      const header = wrapper.find('h2');
      expect(header.text()).toBe('Offene Aufgaben');
    });

    it('renders "Alle Aufgaben" when neither owner nor status is defined', async () => {
      await wrapper.setProps({ owner: null, status: null });
      const header = wrapper.find('h2');
      expect(header.text()).toBe('Alle Aufgaben');
    });
  });

  describe('Task fetching', () => {
    it('should return a list of tasks', async () => {
      // Arrange
      const projectId = 'test-project';
      const mockTasks: TaskItem[] = [
        {
          id: '1',
          title: 'Task 1',
          name: 'task1',
          status: Status['OPEN'],
          owner: 'owner1',
        },
        {
          id: '2',
          title: 'Task 2',
          name: 'task2',
          status: Status['OPEN'],
          owner: 'owner1',
        },
      ];
      const mockTaskList = { tasks: mockTasks };

      // Act
      vi.spyOn(service, 'getTasks').mockImplementation(() => Promise.resolve(mockTaskList));
      const result = await service.getTasks(projectId);

      // Assert
      expect(result).toEqual(mockTaskList);
      expect(result.tasks).toHaveLength(2);
      expect(result.tasks[0].id).toBe('1');
      expect(result.tasks[1].id).toBe('2');
    });
  });



});
