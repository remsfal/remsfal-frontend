import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import IssueDescriptionCard from '@/components/issue/IssueDescriptionCard.vue';
import PrimeVue from 'primevue/config';

// Mock the IssueService
vi.mock('@/services/IssueService', () => ({
  issueService: {
    modifyIssue: vi.fn().mockResolvedValue({}),
  },
}));

describe('IssueDescriptionCard.vue', () => {
  let wrapper: VueWrapper;

  const initialDescription = '## Issue Description\n\nThis is a test description.';

  const createWrapper = () => {
    return mount(IssueDescriptionCard, {
      props: {
        projectId: 'project-123',
        issueId: 'issue-456',
        initialDescription,
      },
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn }), PrimeVue],
        stubs: {
          Toast: true,
        },
      },
    });
  };

  beforeEach(() => {
    wrapper = createWrapper();
  });

  describe('Component Rendering', () => {
    it('should render the component', () => {
      expect(wrapper.exists()).toBe(true);
    });

    it('should render IssueDescription component', () => {
      const issueDesc = wrapper.findComponent({ name: 'IssueDescription' });
      expect(issueDesc.exists()).toBe(true);
    });

    it('should render save description button', () => {
      const button = wrapper.findComponent({ name: 'Button' });
      expect(button.exists()).toBe(true);
    });
  });

  describe('Props', () => {
    it('should receive projectId prop', () => {
      expect(wrapper.props('projectId')).toBe('project-123');
    });

    it('should receive issueId prop', () => {
      expect(wrapper.props('issueId')).toBe('issue-456');
    });

    it('should receive initialDescription prop', () => {
      expect(wrapper.props('initialDescription')).toBe(initialDescription);
    });
  });

  describe('Reactive State', () => {
    it('should populate description from initialDescription', () => {
      expect(wrapper.vm.description).toBe(initialDescription);
    });

    it('should track original description for change detection', () => {
      expect(wrapper.vm.originalDescription).toBe(initialDescription);
    });
  });

  describe('Computed Properties', () => {
    it('should have canSaveDescription as false when no changes made', () => {
      expect(wrapper.vm.canSaveDescription).toBe(false);
    });

    it('should have canSaveDescription as true when description changes', async () => {
      wrapper.vm.description = 'Updated description';
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.canSaveDescription).toBe(true);
    });
  });

  describe('Save Functionality', () => {
    it('should disable save button when no changes', () => {
      const button = wrapper.findComponent({ name: 'Button' });
      expect(button.props('disabled')).toBe(true);
    });

    it('should enable save button when description changes', async () => {
      wrapper.vm.description = 'New description';
      await wrapper.vm.$nextTick();
      
      const button = wrapper.findComponent({ name: 'Button' });
      expect(button.props('disabled')).toBe(false);
    });
  });

  describe('Events', () => {
    it('should emit saved event after successful save', async () => {
      wrapper.vm.description = 'Changed';
      await wrapper.vm.$nextTick();
      
      await wrapper.vm.handleSaveDescription();
      
      expect(wrapper.emitted('saved')).toBeTruthy();
    });
  });
});
