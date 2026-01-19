import { describe, test, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import IssueDetailsCard from '@/components/issue/IssueDetailsCard.vue';
import { issueService } from '@/services/IssueService';

// ─── Toast Mock ──────────────────────────────────────────────────────────────
const addMock = vi.fn();

vi.mock('primevue/usetoast', () => ({
  useToast: () => ({
    add: addMock,
  }),
}));

// ─── Service Mock ────────────────────────────────────────────────────────────
vi.mock('@/services/IssueService', async () => {
  const actual = await vi.importActual<any>('@/services/IssueService');
  return {
    ...actual,
    issueService: {
      modifyIssue: vi.fn(),
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
    ownerId: 'user-1',
    reporter: 'reporter-1',
    project: 'Project A',
    issueType: 'TASK',
    tenancy: 'tenant-1',
  },
};

// ─── Test Suite ──────────────────────────────────────────────────────────────
describe('IssueDetailsCard.vue', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(() => {
    vi.clearAllMocks();

    wrapper = mount(IssueDetailsCard, {
      props: baseProps,
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('renders Issue Details title', () => {
    expect(wrapper.text()).toContain('Issue Details');
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('save button is disabled when no changes are made', () => {
    const button = wrapper.find('button');
    expect(button.attributes('disabled')).toBeDefined();
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('enables save button when title changes', () => {
    wrapper.vm.title = 'New title';
    expect(wrapper.vm.canSave).toBe(true);
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('calls modifyIssue and shows success toast on save', async () => {
    vi.spyOn(issueService, 'modifyIssue').mockResolvedValue(undefined);

    wrapper.vm.title = 'Updated title';

    await wrapper.vm.handleSave();

    expect(issueService.modifyIssue).toHaveBeenCalledWith(
      'project-1',
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
    vi.spyOn(issueService, 'modifyIssue').mockRejectedValue(new Error('fail'));

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
    vi.spyOn(issueService, 'modifyIssue').mockResolvedValue(undefined);

    wrapper.vm.title = 'Updated title';

    const promise = wrapper.vm.handleSave();
    expect(wrapper.vm.loadingSave).toBe(true);

    await promise;

    expect(wrapper.vm.loadingSave).toBe(false);
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('updates original values after successful save', async () => {
    vi.spyOn(issueService, 'modifyIssue').mockResolvedValue(undefined);

    wrapper.vm.title = 'Updated title';

    await wrapper.vm.handleSave();

    expect(wrapper.vm.originalTitle).toBe('Updated title');
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('does not call API when no changes are made', async () => {
    await wrapper.vm.handleSave();

    expect(issueService.modifyIssue).not.toHaveBeenCalled();
  });
});
