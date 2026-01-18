import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import IssueDetailsCard from '@/components/issue/IssueDetailsCard.vue';
import { issueService } from '@/services/IssueService';
import { projectService } from '@/services/ProjectService';

// Mock services
vi.mock('@/services/IssueService', () => ({
  issueService: { modifyIssue: vi.fn() },
  ISSUE_TYPE_TASK: 'TASK',
  ISSUE_TYPE_APPLICATION: 'APPLICATION',
  ISSUE_TYPE_DEFECT: 'DEFECT',
  ISSUE_TYPE_MAINTENANCE: 'MAINTENANCE',
}));

vi.mock('@/services/ProjectService', () => ({
  projectService: { getProjects: vi.fn() },
}));

vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: vi.fn() }) }));
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }));
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
    vi.mocked(projectService.getProjects).mockResolvedValue(mockProjects as any);
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

    it('displays initial title value', async () => {
      const wrapper = mount(IssueDetailsCard, { props: defaultProps });
      await flushPromises();

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

      await wrapper.setProps({
        initialData: { ...defaultProps.initialData, title: 'New Title' },
      });
      await flushPromises();

      const titleInput = wrapper.find('input[type="text"]');
      expect((titleInput.element as HTMLInputElement).value).toBe('New Title');
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
      await titleInput.setValue('Updated Title');
      await wrapper.vm.$nextTick();

      const saveButton = wrapper.find('button');
      expect(saveButton.attributes('disabled')).toBeUndefined();
    });

    it('statusOptions contains all valid statuses', async () => {
      const wrapper = mount(IssueDetailsCard, { props: defaultProps });
      await flushPromises();

      const vm = wrapper.vm as any;
      expect(vm.statusOptions).toEqual([
        { label: 'Open', value: 'OPEN' },
        { label: 'Pending', value: 'PENDING' },
        { label: 'In Progress', value: 'IN_PROGRESS' },
        { label: 'Closed', value: 'CLOSED' },
        { label: 'Rejected', value: 'REJECTED' },
      ]);
    });

    it('typeOptions contains all issue types', async () => {
      const wrapper = mount(IssueDetailsCard, { props: defaultProps });
      await flushPromises();

      const vm = wrapper.vm as any;
      expect(vm.typeOptions.length).toBe(4);
      expect(vm.typeOptions[0]).toEqual({ label: 'Task', value: 'TASK' });
    });
  });

  describe('Projects Loading', () => {
    it('fetches projects on mount', async () => {
      mount(IssueDetailsCard, { props: defaultProps });
      await flushPromises();

      expect(projectService.getProjects).toHaveBeenCalled();
    });

    it('shows loading state while fetching projects', async () => {
      vi.mocked(projectService.getProjects).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockProjects as any), 100))
      );

      const wrapper = mount(IssueDetailsCard, { props: defaultProps });
      
      const vm = wrapper.vm as any;
      expect(vm.loadingProjects).toBe(true);

      await flushPromises();
      expect(vm.loadingProjects).toBe(false);
    });

    it('populates projectOptions after loading', async () => {
      const wrapper = mount(IssueDetailsCard, { props: defaultProps });
      await flushPromises();

      const vm = wrapper.vm as any;
      expect(vm.projectOptions).toEqual([
        { label: 'Project A', value: 'proj-1' },
        { label: 'Project B', value: 'proj-2' },
      ]);
    });

    it('handles project fetch error gracefully', async () => {
      vi.mocked(projectService.getProjects).mockRejectedValue(new Error('Network error'));

      const wrapper = mount(IssueDetailsCard, { props: defaultProps });
      await flushPromises();

      const vm = wrapper.vm as any;
      expect(vm.projects).toEqual([]);
    });
  });

  describe('Save Functionality', () => {
    it('calls issueService.modifyIssue with correct payload', async () => {
      vi.mocked(issueService.modifyIssue).mockResolvedValue({} as any);

      const wrapper = mount(IssueDetailsCard, { props: defaultProps });
      await flushPromises();

      const titleInput = wrapper.find('input[type="text"]');
      await titleInput.setValue('Updated Title');
      await wrapper.vm.$nextTick();

      const saveButton = wrapper.find('button');
      await saveButton.trigger('click');
      await flushPromises();

      expect(issueService.modifyIssue).toHaveBeenCalledWith(
        'proj-1',
        'issue-1',
        expect.objectContaining({ title: 'Updated Title' })
      );
    });

    it('emits saved event after successful save', async () => {
      vi.mocked(issueService.modifyIssue).mockResolvedValue({} as any);

      const wrapper = mount(IssueDetailsCard, { props: defaultProps });
      await flushPromises();

      const titleInput = wrapper.find('input[type="text"]');
      await titleInput.setValue('Updated Title');
      await wrapper.vm.$nextTick();

      const saveButton = wrapper.find('button');
      await saveButton.trigger('click');
      await flushPromises();

      expect(wrapper.emitted('saved')).toBeTruthy();
    });

    it('disables save button during save operation', async () => {
      vi.mocked(issueService.modifyIssue).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({} as any), 100))
      );

      const wrapper = mount(IssueDetailsCard, { props: defaultProps });
      await flushPromises();

      const titleInput = wrapper.find('input[type="text"]');
      await titleInput.setValue('Updated Title');
      await wrapper.vm.$nextTick();

      const saveButton = wrapper.find('button');
      await saveButton.trigger('click');

      const vm = wrapper.vm as any;
      expect(vm.loadingSave).toBe(true);
      
      await flushPromises();
      expect(vm.loadingSave).toBe(false);
    });

    it('handles save error gracefully', async () => {
      vi.mocked(issueService.modifyIssue).mockRejectedValue(new Error('Save failed'));

      const wrapper = mount(IssueDetailsCard, { props: defaultProps });
      await flushPromises();

      const titleInput = wrapper.find('input[type="text"]');
      await titleInput.setValue('Updated Title');
      await wrapper.vm.$nextTick();

      const saveButton = wrapper.find('button');
      await saveButton.trigger('click');
      await flushPromises();

      expect(wrapper.emitted('saved')).toBeFalsy();
    });

    it('only includes changed fields in payload', async () => {
      vi.mocked(issueService.modifyIssue).mockResolvedValue({} as any);

      const wrapper = mount(IssueDetailsCard, { props: defaultProps });
      await flushPromises();

      const titleInput = wrapper.find('input[type="text"]');
      await titleInput.setValue('Updated Title');
      await wrapper.vm.$nextTick();

      const saveButton = wrapper.find('button');
      await saveButton.trigger('click');
      await flushPromises();

      const callArgs = vi.mocked(issueService.modifyIssue).mock.calls[0][2];
      expect(callArgs).toHaveProperty('title');
      expect(callArgs).not.toHaveProperty('reporter');
    });
  });

  describe('Field Changes', () => {
    it('updates title when user types', async () => {
      const wrapper = mount(IssueDetailsCard, { props: defaultProps });
      await flushPromises();

      const titleInput = wrapper.find('input[type="text"]');
      await titleInput.setValue('New Title');

      const vm = wrapper.vm as any;
      expect(vm.title).toBe('New Title');
    });

    it('detects status change', async () => {
      const wrapper = mount(IssueDetailsCard, { props: defaultProps });
      await flushPromises();

      const vm = wrapper.vm as any;
      vm.status = 'CLOSED';
      await wrapper.vm.$nextTick();

      expect(vm.canSave).toBe(true);
    });

    it('detects type change', async () => {
      const wrapper = mount(IssueDetailsCard, { props: defaultProps });
      await flushPromises();

      const vm = wrapper.vm as any;
      vm.issueType = 'DEFECT';
      await wrapper.vm.$nextTick();

      expect(vm.canSave).toBe(true);
    });

    it('detects ownerId change', async () => {
      const wrapper = mount(IssueDetailsCard, { props: defaultProps });
      await flushPromises();

      const vm = wrapper.vm as any;
      vm.ownerId = 'new-owner';
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

    it('handles undefined project in dropdown', async () => {
      vi.mocked(projectService.getProjects).mockResolvedValue([]);

      const wrapper = mount(IssueDetailsCard, { props: defaultProps });
      await flushPromises();

      const vm = wrapper.vm as any;
      expect(vm.projectOptions).toEqual([]);
    });

    it('prevents save when already saving', async () => {
      vi.mocked(issueService.modifyIssue).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({} as any), 100))
      );

      const wrapper = mount(IssueDetailsCard, { props: defaultProps });
      await flushPromises();

      const titleInput = wrapper.find('input[type="text"]');
      await titleInput.setValue('Updated Title');
      await wrapper.vm.$nextTick();

      const saveButton = wrapper.find('button');
      await saveButton.trigger('click');
      await saveButton.trigger('click');

      expect(issueService.modifyIssue).toHaveBeenCalledTimes(1);
    });
  });
});
