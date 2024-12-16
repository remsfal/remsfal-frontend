import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
// @ts-ignore
import TaskView from '../../src/views/TaskView.vue';
import PrimeVue from 'primevue/config';
import { ref } from 'vue';

// Mock task data and functions
const tasks = ref([
  { id: 1, status: 'OPEN', owner: 'user1' },
  { id: 2, status: 'CLOSED', owner: 'user2' },
  { id: 3, status: 'OPEN', owner: 'user1' },
  { id: 4, status: 'IN_PROGRESS', owner: 'user3' },
]);

const filterOpenTasks = (): { id: number; status: string; owner: string }[] => {
  return tasks.value.filter((task) => task.status === 'OPEN');
};

const filterMineTasks = (owner: string): { id: number; status: string; owner: string }[] => {
  return tasks.value.filter((task) => task.owner === owner);
};

describe('TaskView', () => {
  const projectId = '1';
  const owner = 'user1';
  let wrapper: VueWrapper<TaskView>;

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

  // Group 1: Testing the filterOpenTasks function
  describe('filterOpenTasks', () => {
    it('filters tasks with status "OPEN"', () => {
      const result = filterOpenTasks();
      expect(result).toEqual([
        { id: 1, status: 'OPEN', owner: 'user1' },
        { id: 3, status: 'OPEN', owner: 'user1' },
      ]);
    });

    it('returns an empty array when no tasks have status "OPEN"', () => {
      tasks.value = [
        { id: 1, status: 'CLOSED', owner: 'user1' },
        { id: 2, status: 'IN_PROGRESS', owner: 'user2' },
      ];
      const result = filterOpenTasks();
      expect(result).toEqual([]);
    });

    it('handles an empty tasks array', () => {
      tasks.value = [];
      const result = filterOpenTasks();
      expect(result).toEqual([]);
    });
  });

  // Group 2: Testing the filterMineTasks function
  describe('filterMineTasks', () => {
    it('returns tasks for the correct owner', () => {
      tasks.value = [
        { id: 1, owner: 'user1', status: 'OPEN' },
        { id: 2, owner: 'user2', status: 'CLOSED' },
        { id: 3, owner: 'user1', status: 'OPEN' },
        { id: 4, owner: 'user3', status: 'IN_PROGRESS' },
      ];
      const result = filterMineTasks('user3');
      expect(result).toEqual([{ id: 4, owner: 'user3', status: 'IN_PROGRESS' }]);
    });

    it('returns an empty array when no tasks belong to the owner', () => {
      tasks.value = [
        { id: 1, owner: 'user2', status: 'OPEN' },
        { id: 2, owner: 'user2', status: 'CLOSED' },
      ];
      const result = filterMineTasks('user1');
      expect(result).toEqual([]);
    });
  });

  // Group 3: Testing button rendering and interaction
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
});
