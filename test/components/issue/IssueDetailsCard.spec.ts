import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import IssueDetailsCard from '@/components/issue/IssueDetailsCard.vue';
import PrimeVue from 'primevue/config';

// Mock the services
vi.mock('@/services/IssueService', () => ({
  issueService: {
    modifyIssue: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('@/services/ProjectService', () => ({
  projectService: {
    getProjects: vi.fn().mockResolvedValue({
      projects: [
        { id: 'project-1', title: 'Project Alpha' },
        { id: 'project-2', title: 'Project Beta' },
        { id: 'project-3', title: 'Project Gamma' },
      ],
    }),
  },
}));

describe('IssueDetailsCard.vue', () => {
  let wrapper: VueWrapper;

  const initialData = {
    issueId: '#ISSUE-123',
    title: 'Fix login bug',
    status: 'OPEN',
    ownerId: 'user-456',
    reporter: 'user-123',
    project: 'project-1',
    issueType: 'TASK',
    tenancy: 'tenant-789',
  };

  const createWrapper = () => {
    return mount(IssueDetailsCard, {
      props: {
        projectId: 'project-123',
        issueId: 'issue-456',
        initialData,
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

    it('should render issue details form fields', () => {
      const inputs = wrapper.findAllComponents({ name: 'InputText' });
      expect(inputs.length).toBeGreaterThan(0);
    });

    it('should render status and type dropdowns', () => {
      const selects = wrapper.findAllComponents({ name: 'Select' });
      expect(selects.length).toBeGreaterThanOrEqual(3); // Status, Type, and Project
    });

    it('should render save button', () => {
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

    it('should receive initialData prop', () => {
      const props = wrapper.props('initialData');
      expect(props).toEqual(initialData);
    });
  });

  describe('Reactive State', () => {
    it('should populate form fields from initialData', async () => {
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.title).toBe('Fix login bug');
      expect(wrapper.vm.status).toBe('OPEN');
      expect(wrapper.vm.issueType).toBe('TASK');
    });

    it('should track original values for change detection', () => {
      expect(wrapper.vm.originalTitle).toBe('Fix login bug');
      expect(wrapper.vm.originalStatus).toBe('OPEN');
      expect(wrapper.vm.originalIssueType).toBe('TASK');
    });
  });

  describe('Computed Properties', () => {
    it('should have canSave as false when no changes made', () => {
      expect(wrapper.vm.canSave).toBe(false);
    });

    it('should have canSave as true when title changes', async () => {
      wrapper.vm.title = 'Updated title';
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.canSave).toBe(true);
    });

    it('should have canSave as true when status changes', async () => {
      wrapper.vm.status = 'IN_PROGRESS';
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.canSave).toBe(true);
    });

    it('should have canSave as true when type changes', async () => {
      wrapper.vm.issueType = 'DEFECT';
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.canSave).toBe(true);
    });

    it('should compute projectOptions from projects list', async () => {
      await wrapper.vm.$nextTick();
      await new Promise(resolve => setTimeout(resolve, 100)); // Wait for projects to load
      
      expect(wrapper.vm.projectOptions).toBeDefined();
      expect(wrapper.vm.projectOptions.length).toBeGreaterThan(0);
    });
  });

  describe('Select Options', () => {
    it('should have statusOptions', () => {
      expect(wrapper.vm.statusOptions).toBeDefined();
      expect(wrapper.vm.statusOptions.length).toBe(5);
    });

    it('should have typeOptions', () => {
      expect(wrapper.vm.typeOptions).toBeDefined();
      expect(wrapper.vm.typeOptions.length).toBe(4);
    });

    it('should include all status values', () => {
      const statusValues = wrapper.vm.statusOptions.map((o: any) => o.value);
      expect(statusValues).toContain('PENDING');
      expect(statusValues).toContain('OPEN');
      expect(statusValues).toContain('IN_PROGRESS');
      expect(statusValues).toContain('CLOSED');
      expect(statusValues).toContain('REJECTED');
    });

    it('should include all type values', () => {
      const typeValues = wrapper.vm.typeOptions.map((o: any) => o.value);
      expect(typeValues).toContain('APPLICATION');
      expect(typeValues).toContain('TASK');
      expect(typeValues).toContain('DEFECT');
      expect(typeValues).toContain('MAINTENANCE');
    });
  });

  describe('Projects Loading', () => {
    it('should fetch projects on mount', async () => {
      const { projectService } = await import('@/services/ProjectService');
      expect(projectService.getProjects).toHaveBeenCalled();
    });

    it('should populate projects after loading', async () => {
      await wrapper.vm.$nextTick();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(wrapper.vm.projects).toBeDefined();
      expect(wrapper.vm.projects.length).toBeGreaterThan(0);
    });
  });

  describe('Type Field Updates', () => {
    it('should update issueType when type dropdown changes', async () => {
      wrapper.vm.issueType = 'DEFECT';
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.issueType).toBe('DEFECT');
    });

    it('should reflect type changes immediately', async () => {
      const initialType = wrapper.vm.issueType;
      wrapper.vm.issueType = 'MAINTENANCE';
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.issueType).not.toBe(initialType);
      expect(wrapper.vm.issueType).toBe('MAINTENANCE');
    });
  });

  describe('Save Functionality', () => {
    it('should call handleSave when save button clicked', async () => {
      const spy = vi.spyOn(wrapper.vm, 'handleSave');
      wrapper.vm.title = 'Changed title';
      await wrapper.vm.$nextTick();
      
      const button = wrapper.findComponent({ name: 'Button' });
      await button.trigger('click');
      
      expect(spy).toHaveBeenCalled();
    });

    it('should disable save button when no changes', () => {
      const button = wrapper.findComponent({ name: 'Button' });
      expect(button.props('disabled')).toBe(true);
    });

    it('should enable save button when changes exist', async () => {
      wrapper.vm.title = 'New title';
      await wrapper.vm.$nextTick();
      
      const button = wrapper.findComponent({ name: 'Button' });
      expect(button.props('disabled')).toBe(false);
    });
  });

  describe('Events', () => {
    it('should emit saved event after successful save', async () => {
      wrapper.vm.title = 'Changed';
      await wrapper.vm.$nextTick();
      
      await wrapper.vm.handleSave();
      
      expect(wrapper.emitted('saved')).toBeTruthy();
    });
  });
});
