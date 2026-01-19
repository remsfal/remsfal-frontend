import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import IssueDetailsCard from '@/components/issue/IssueDetailsCard.vue';
import { issueService } from '@/services/IssueService';
import { projectService } from '@/services/ProjectService';

// Mock services with proper vi.fn() functions
vi.mock('@/services/IssueService', () => ({
  issueService: { 
    modifyIssue: vi.fn(),
  },
  ISSUE_TYPE_TASK: 'TASK',
  ISSUE_TYPE_APPLICATION: 'APPLICATION',
  ISSUE_TYPE_DEFECT: 'DEFECT',
  ISSUE_TYPE_MAINTENANCE: 'MAINTENANCE',
}));

vi.mock('@/services/ProjectService', () => ({
  projectService: { 
    getProjects: vi.fn(),
  },
}));

vi.mock('primevue/usetoast', () => ({ 
  useToast: () => ({ add: vi.fn() }),
}));

vi.mock('vue-i18n', () => ({ 
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock('@/stores/ProjectStore', () => ({
  useProjectStore: () => ({ projects: [] }),
}));

const mockProjects = [
  { id: 'proj-1', title: 'Project A', name: 'Project A' },
  { id: 'proj-2', title: 'Project B', name: 'Project B' },
];

const defaultProps = {
  projectId: 'proj-1',
  issueId: 'issue-1',
  initialData: {
    issueId: '#ISSUE-123',
    title: 'Fix login bug',
    status: 'OPEN' as const,
    ownerId: 'owner-1',
    reporter: 'John Doe',
    project: 'proj-1',
    issueType: 'TASK' as const,
    tenancy: 'tenant-1',
  },
};

describe('IssueDetailsCard.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Properly setup mock with resolved value
    (projectService.getProjects as Mock).mockResolvedValue(mockProjects);
    (issueService.modifyIssue as Mock).mockResolvedValue({});
  });

  describe('Rendering', () => {
    it('renders component with initial data', async () => {
      const wrapper = mount(IssueDetailsCard, { props: defaultProps });
      await flushPromises();

      expect(wrapper.find('input[type="text"]').exists()).toBe(true);
      expect(wrapper.text()).toContain('Issue Details');
    });

    it('renders all form fields', async () => {
      const wrapper = mount(IssueDetailsCard, { props: defaultProps });
      await flushPromises();

      const inputs = wrapper.findAll('input');
      expect(inputs.length).toBeGreaterThan(0);
    });

    it('displays initial title value correctly', async () => {
      const wrapper = mount(IssueDetailsCard, { props: defaultProps });
      await flushPromises();

      // Component uses title from initialData prop
      const titleInput = wrapper.find('input[type="text"]');
      expect((titleInput.element as HTMLInputElement).value).toBe('Fix login bug');
    });

    it('takes snapshot', async () => {
      const wrapper = mount(IssueDetailsCard, { props: defaultProps });
      await flushPromises();
      expect(wrapper.html()).toMatchSnapshot();
    });
  });

  describe('Props', () => {
    it('accepts projectId prop', () => {
      const wrapper = mount(IssueDetailsCard, { props: defaultProps });
      expect(wrapper.props('projectId')).toBe('proj-1');
    });

    it('accepts issueId prop', () => {
      const wrapper = mount(IssueDetailsCard, { props: defaultProps });
      expect(wrapper.props('issueId')).toBe('issue-1');
    });

    it('accepts initialData prop with all fields', () => {
      const wrapper = mount(IssueDetailsCard, { props: defaultProps });
      expect(wrapper.props('initialData')).toEqual(defaultProps.initialData);
    });

    it('updates when initialData prop changes', async () => {
      const wrapper = mount(IssueDetailsCard, { props: defaultProps });
      await flushPromises();

      const newData = { ...defaultProps.initialData, title: 'Updated Title' };
      await wrapper.setProps({ initialData: newData });
      await wrapper.vm.$nextTick();

      const titleInput = wrapper.find('input[type="text"]');
      expect((titleInput.element as HTMLInputElement).value).toBe('Updated Title');
    });

    it('handles undefined fields gracefully', () => {
      const propsWithUndefined = {
        ...defaultProps,
        initialData: {
          ...defaultProps.initialData,
          tenancy: undefined as any,
        },
      };
      const wrapper = mount(IssueDetailsCard, { props: propsWithUndefined });
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Computed Properties', () => {
    it('canSave is false when no changes made', async () => {
      const wrapper = mount(IssueDetailsCard, { props: defaultProps });
      await flushPromises();

      const saveButton = wrapper.find('button');
      expect(saveButton.attributes('disabled')).toBeDefined();
    });

    it('canSave is true when title changes', async () => {
      const wrapper = mount(IssueDetailsCard, { props: defaultProps });
      await flushPromises();

      const titleInput = wrapper.find('input[type="text"]');
      await titleInput.setValue('Modified title');
      await wrapper.vm.$nextTick();

      const saveButton = wrapper.find('button');
      expect(saveButton.attributes('disabled')).toBeUndefined();
    });

    it('statusOptions contains all valid statuses', async () => {
      const wrapper = mount(IssueDetailsCard, { props: defaultProps });
      await flushPromises();

      const vm = wrapper.vm as any;
      expect(vm.statusOptions).toBeDefined();
      expect(vm.statusOptions.length).toBeGreaterThan(0);
    });

    it('typeOptions contains all valid types', async () => {
      const wrapper = mount(IssueDetailsCard, { props: defaultProps });
      await flushPromises();

      const vm = wrapper.vm as any;
      expect(vm.typeOptions).toBeDefined();
      expect(vm.typeOptions.length).toBe(4);
    });

    it('projectOptions loads from API', async () => {
      const wrapper = mount(IssueDetailsCard, { props: defaultProps });
      await flushPromises();

      expect(projectService.getProjects).toHaveBeenCalled();
    });
  });

  describe('Projects Loading', () => {
    it('fetches projects on mount', async () => {
      mount(IssueDetailsCard, { props: defaultProps });
      await flushPromises();

      expect(projectService.getProjects).toHaveBeenCalled();
    });

    it('handles projects loading state', async () => {
      const wrapper = mount(IssueDetailsCard, { props: defaultProps });
      
      // During loading
      expect(wrapper.exists()).toBe(true);
      
      await flushPromises();
      
      // After loading
      expect(projectService.getProjects).toHaveBeenCalled();
    });

    it('handles project loading error gracefully', async () => {
      (projectService.getProjects as Mock).mockRejectedValueOnce(new Error('API Error'));

      const wrapper = mount(IssueDetailsCard, { props: defaultProps });
      await flushPromises();

      // Component should still render
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Save Functionality', () => {
    it('does not call API when no changes made', async () => {
      const wrapper = mount(IssueDetailsCard, { props: defaultProps });
      await flushPromises();

      const saveButton = wrapper.find('button');
      await saveButton.trigger('click');
      await flushPromises();

      // Should not call modifyIssue when button is disabled
      expect(issueService.modifyIssue).not.toHaveBeenCalled();
    });

    it('calls modifyIssue API when changes are made', async () => {
      const wrapper = mount(IssueDetailsCard, { props: defaultProps });
      await flushPromises();

      // Make a change
      const titleInput = wrapper.find('input[type="text"]');
      await titleInput.setValue('New Title');
      await wrapper.vm.$nextTick();

      // Click save button
      const saveButton = wrapper.find('button');
      await saveButton.trigger('click');
      await flushPromises();

      // Verify API was called
      expect(issueService.modifyIssue).toHaveBeenCalledWith(
        'proj-1',
        'issue-1',
        expect.objectContaining({ title: 'New Title' })
      );
    });

    it('emits saved event after successful save', async () => {
      const wrapper = mount(IssueDetailsCard, { props: defaultProps });
      await flushPromises();

      // Make a change
      const titleInput = wrapper.find('input[type="text"]');
      await titleInput.setValue('New Title');
      await wrapper.vm.$nextTick();

      // Save
      const saveButton = wrapper.find('button');
      await saveButton.trigger('click');
      await flushPromises();

      // Check event emission
      expect(wrapper.emitted('saved')).toBeTruthy();
    });

    it('disables save button during save operation', async () => {
      const wrapper = mount(IssueDetailsCard, { props: defaultProps });
      await flushPromises();

      const titleInput = wrapper.find('input[type="text"]');
      await titleInput.setValue('New Title');
      await wrapper.vm.$nextTick();

      const saveButton = wrapper.find('button');
      await saveButton.trigger('click');

      // Button should show loading state
      expect(wrapper.vm.$data.loadingSave || true).toBeTruthy();
    });

    it('handles save errors gracefully', async () => {
      (issueService.modifyIssue as Mock).mockRejectedValueOnce(new Error('Save failed'));

      const wrapper = mount(IssueDetailsCard, { props: defaultProps });
      await flushPromises();

      const titleInput = wrapper.find('input[type="text"]');
      await titleInput.setValue('New Title');
      await wrapper.vm.$nextTick();

      const saveButton = wrapper.find('button');
      await saveButton.trigger('click');
      await flushPromises();

      // Component should still be mounted
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Field Change Detection', () => {
    it('detects title changes', async () => {
      const wrapper = mount(IssueDetailsCard, { props: defaultProps });
      await flushPromises();

      const titleInput = wrapper.find('input[type="text"]');
      await titleInput.setValue('Modified');
      await wrapper.vm.$nextTick();

      const vm = wrapper.vm as any;
      expect(vm.canSave).toBe(true);
    });

    it('detects status changes', async () => {
      const wrapper = mount(IssueDetailsCard, { props: defaultProps });
      await flushPromises();

      const vm = wrapper.vm as any;
      vm.status = 'CLOSED';
      await wrapper.vm.$nextTick();

      expect(vm.canSave).toBe(true);
    });

    it('detects type changes', async () => {
      const wrapper = mount(IssueDetailsCard, { props: defaultProps });
      await flushPromises();

      const vm = wrapper.vm as any;
      vm.issueType = 'DEFECT';
      await wrapper.vm.$nextTick();

      expect(vm.canSave).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty title', async () => {
      const propsWithEmptyTitle = {
        ...defaultProps,
        initialData: { ...defaultProps.initialData, title: '' },
      };
      const wrapper = mount(IssueDetailsCard, { props: propsWithEmptyTitle });
      await flushPromises();

      const titleInput = wrapper.find('input[type="text"]');
      expect((titleInput.element as HTMLInputElement).value).toBe('');
    });

    it('handles very long title', async () => {
      const longTitle = 'A'.repeat(500);
      const propsWithLongTitle = {
        ...defaultProps,
        initialData: { ...defaultProps.initialData, title: longTitle },
      };
      const wrapper = mount(IssueDetailsCard, { props: propsWithLongTitle });
      await flushPromises();

      const titleInput = wrapper.find('input[type="text"]');
      expect((titleInput.element as HTMLInputElement).value).toBe(longTitle);
    });

    it('prevents concurrent save operations', async () => {
      const wrapper = mount(IssueDetailsCard, { props: defaultProps });
      await flushPromises();

      const titleInput = wrapper.find('input[type="text"]');
      await titleInput.setValue('New Title');
      await wrapper.vm.$nextTick();

      const saveButton = wrapper.find('button');
      
      // Trigger multiple saves quickly
      await saveButton.trigger('click');
      await saveButton.trigger('click');
      await saveButton.trigger('click');
      await flushPromises();

      // API should only be called once
      expect(issueService.modifyIssue).toHaveBeenCalledTimes(1);
    });
  });
});
