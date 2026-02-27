import { describe, test, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import IssueDetailsCard from '@/components/issue/IssueDetailsCard.vue';
import { issueService } from '@/services/IssueService';
import { projectMemberService, type ProjectMemberList } from '@/services/ProjectMemberService';

// ─── Toast Mock ──────────────────────────────────────────────────────────────
const addMock = vi.fn();

vi.mock('primevue/usetoast', () => ({useToast: () => ({add: addMock,}),}));

// ─── Service Mock ────────────────────────────────────────────────────────────
vi.mock('@/services/IssueService', async () => {
  const actual = await vi.importActual<typeof import('@/services/IssueService')>('@/services/IssueService');
  return {
    ...actual,
    issueService: {updateIssue: vi.fn(),},
  };
});

vi.mock('@/services/ProjectMemberService', async () => {
  const actual = await vi.importActual<typeof import('@/services/ProjectMemberService')>('@/services/ProjectMemberService');
  return {
    ...actual,
    projectMemberService: {
      getMembers: vi.fn().mockResolvedValue({
        members: [
          {
            id: 'user-1', name: 'John Doe', email: 'john@example.com', role: 'MANAGER',
          },
          {
            id: 'reporter-1', name: 'Jane Smith', email: 'jane@example.com', role: 'STAFF',
          },
        ],
      }),
    },
  };
});

// ─── Test Data ───────────────────────────────────────────────────────────────
const baseProps = {
  projectId: 'project-1',
  issueId: 'issue-1',
  initialData: {
    issueId: 'issue-1',
    title: 'Old title',
    status: 'OPEN',
    assigneeId: 'user-1',
    reporter: 'reporter-1',
    project: 'Project A',
    issueType: 'TASK',
    tenancy: 'tenant-1',
  },
};

// ─── Test Suite ──────────────────────────────────────────────────────────────
describe('IssueDetailsCard.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof IssueDetailsCard>>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Re-mock projectMemberService for each test
    vi.spyOn(projectMemberService, 'getMembers').mockResolvedValue({
      members: [
        {
          id: 'user-1', name: 'John Doe', email: 'john@example.com', role: 'MANAGER',
        },
        {
          id: 'reporter-1', name: 'Jane Smith', email: 'jane@example.com', role: 'STAFF',
        },
      ],
    } as ProjectMemberList);

    wrapper = mount(IssueDetailsCard, {props: baseProps,});
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('renders Issue Details title', () => {
    expect(wrapper.text()).toContain('Issue Details');
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('save button is disabled when no changes are made', async () => {
    await wrapper.vm.$nextTick();
    const buttons = wrapper.findAll('button');
    const saveButton = buttons.find(b => b.text().includes('Save'));
    expect(saveButton?.attributes('disabled')).toBeDefined();
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('enables save button when title changes', () => {
    wrapper.vm.title = 'New title';
    expect(wrapper.vm.canSave).toBe(true);
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('calls updateIssue and shows success toast on save', async () => {
    vi.spyOn(issueService, 'updateIssue').mockResolvedValue(undefined);

    wrapper.vm.title = 'Updated title';

    await wrapper.vm.handleSave();

    expect(issueService.updateIssue).toHaveBeenCalledWith(
      'issue-1',
      { title: 'Updated title' },
    );

    expect(addMock).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'success',
        summary: expect.any(String),
        detail: expect.any(String),
      }),
    );
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('shows error toast when API call fails', async () => {
    vi.spyOn(issueService, 'updateIssue').mockRejectedValue(new Error('fail'));

    wrapper.vm.title = 'Broken title';

    await wrapper.vm.handleSave();

    expect(addMock).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to save issue details',
      }),
    );
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('sets loadingSave during save', async () => {
    vi.spyOn(issueService, 'updateIssue').mockResolvedValue(undefined);

    wrapper.vm.title = 'Updated title';

    const promise = wrapper.vm.handleSave();
    expect(wrapper.vm.loadingSave).toBe(true);

    await promise;

    expect(wrapper.vm.loadingSave).toBe(false);
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('updates original values after successful save', async () => {
    vi.spyOn(issueService, 'updateIssue').mockResolvedValue(undefined);

    wrapper.vm.title = 'Updated title';

    await wrapper.vm.handleSave();

    expect(wrapper.vm.originalTitle).toBe('Updated title');
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('does not call API when no changes are made', async () => {
    await wrapper.vm.handleSave();

    expect(issueService.updateIssue).not.toHaveBeenCalled();
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('detects change in status field', () => {
    wrapper.vm.status = 'CLOSED';
    expect(wrapper.vm.canSave).toBe(true);
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('detects change in assigneeId field', () => {
    wrapper.vm.assigneeId = 'user-2';
    expect(wrapper.vm.canSave).toBe(true);
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('detects change in issueType field', () => {
    wrapper.vm.issueType = 'DEFECT';
    expect(wrapper.vm.canSave).toBe(true);
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('detects change in tenancy field', () => {
    wrapper.vm.tenancy = 'tenant-2';
    expect(wrapper.vm.canSave).toBe(true);
  });


  // ───────────────────────────────────────────────────────────────────────────
  test('includes only changed fields in API payload', async () => {
    vi.spyOn(issueService, 'updateIssue').mockResolvedValue(undefined);

    wrapper.vm.title = 'New title';
    wrapper.vm.status = 'IN_PROGRESS';

    await wrapper.vm.handleSave();

    expect(issueService.updateIssue).toHaveBeenCalledWith(
      'issue-1',
      { title: 'New title', status: 'IN_PROGRESS' },
    );
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('does not save when loadingSave is true', async () => {
    wrapper.vm.title = 'New title';
    wrapper.vm.loadingSave = true;

    await wrapper.vm.handleSave();

    expect(issueService.updateIssue).not.toHaveBeenCalled();
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('emits saved event after successful save', async () => {
    vi.spyOn(issueService, 'updateIssue').mockResolvedValue(undefined);

    wrapper.vm.title = 'New title';
    await wrapper.vm.handleSave();

    expect(wrapper.emitted()).toHaveProperty('saved');
    expect(wrapper.emitted('saved')![0]).toEqual([]);
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('resets loadingSave to false after error', async () => {
    vi.spyOn(issueService, 'updateIssue').mockRejectedValue(new Error('fail'));

    wrapper.vm.title = 'New title';
    await wrapper.vm.handleSave();

    expect(wrapper.vm.loadingSave).toBe(false);
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('updates all original values after save', async () => {
    vi.spyOn(issueService, 'updateIssue').mockResolvedValue(undefined);

    wrapper.vm.title = 'New title';
    wrapper.vm.status = 'CLOSED';
    wrapper.vm.issueType = 'DEFECT';

    await wrapper.vm.handleSave();

    expect(wrapper.vm.originalTitle).toBe('New title');
    expect(wrapper.vm.originalStatus).toBe('CLOSED');
    expect(wrapper.vm.originalIssueType).toBe('DEFECT');
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('handles empty string values', () => {
    wrapper.vm.title = '';
    expect(wrapper.vm.canSave).toBe(true);
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('handles undefined field values', async () => {
    wrapper.vm.tenancy = undefined as unknown as string;
    expect(wrapper.vm.canSave).toBe(true);
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('prevents concurrent saves', async () => {
    vi.spyOn(issueService, 'updateIssue').mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    wrapper.vm.title = 'First';
    const promise1 = wrapper.vm.handleSave();
    const promise2 = wrapper.vm.handleSave();

    await Promise.all([promise1, promise2]);

    expect(issueService.updateIssue).toHaveBeenCalledTimes(1);
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('handles very long title', async () => {
    vi.spyOn(issueService, 'updateIssue').mockResolvedValue(undefined);

    const longTitle = 'A'.repeat(1000);
    wrapper.vm.title = longTitle;

    await wrapper.vm.handleSave();

    expect(issueService.updateIssue).toHaveBeenCalledWith(
      'issue-1',
      { title: longTitle },
    );
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('handles special characters in title', async () => {
    vi.spyOn(issueService, 'updateIssue').mockResolvedValue(undefined);

    wrapper.vm.title = '<script>alert("XSS")</script>';

    await wrapper.vm.handleSave();

    expect(issueService.updateIssue).toHaveBeenCalledWith(
      'issue-1',
      { title: '<script>alert("XSS")</script>' },
    );
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('preserves field values after failed save', async () => {
    vi.spyOn(issueService, 'updateIssue').mockRejectedValue(new Error('fail'));

    wrapper.vm.title = 'Failed title';
    await wrapper.vm.handleSave();

    expect(wrapper.vm.title).toBe('Failed title');
    expect(wrapper.vm.originalTitle).toBe('Old title');
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('canSave returns false when all fields match originals', () => {
    expect(wrapper.vm.canSave).toBe(false);
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('shows correct toast message on successful save', async () => {
    vi.spyOn(issueService, 'updateIssue').mockResolvedValue(undefined);

    wrapper.vm.title = 'Updated';
    await wrapper.vm.handleSave();

    expect(addMock).toHaveBeenCalledWith(
      expect.objectContaining({severity: 'success',}),
    );
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('resolves reporter name from member ID', async () => {
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(wrapper.vm.reporterName).toBe('Jane Smith');
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('shows UUID fallback if member not found', async () => {
    const wrapperWithDeletedMember = mount(IssueDetailsCard, {
      props: {
        ...baseProps,
        initialData: {
          ...baseProps.initialData,
          reporter: 'deleted-user-999',
        },
      },
    });

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(wrapperWithDeletedMember.vm.reporterName).toBe('deleted-user-999');
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('loads members on mount', async () => {
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(projectMemberService.getMembers).toHaveBeenCalledWith('project-1');
  });
});
