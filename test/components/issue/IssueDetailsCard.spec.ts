import { describe, test, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import IssueDetailsCard from '@/components/issue/IssueDetailsCard.vue';
import { issueService } from '@/services/IssueService';

// ─── Toast Mock ──────────────────────────────────────────────────────────────
const addMock = vi.fn();

vi.mock('primevue/usetoast', () => ({useToast: () => ({add: addMock,}),}));

// ─── Service Mock ────────────────────────────────────────────────────────────
vi.mock('@/services/IssueService', async () => {
  const actual = await vi.importActual<any>('@/services/IssueService');
  return {
    ...actual,
    issueService: {modifyIssue: vi.fn(),},
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

    wrapper = mount(IssueDetailsCard, {props: baseProps,});
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

  // ───────────────────────────────────────────────────────────────────────────
  test('detects change in status field', () => {
    wrapper.vm.status = 'CLOSED';
    expect(wrapper.vm.canSave).toBe(true);
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('detects change in ownerId field', () => {
    wrapper.vm.ownerId = 'user-2';
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
  test('detects change in reporter field', () => {
    wrapper.vm.reporter = 'reporter-2';
    expect(wrapper.vm.canSave).toBe(true);
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('detects change in project field', () => {
    wrapper.vm.project = 'Project B';
    expect(wrapper.vm.canSave).toBe(true);
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('includes only changed fields in API payload', async () => {
    vi.spyOn(issueService, 'modifyIssue').mockResolvedValue(undefined);

    wrapper.vm.title = 'New title';
    wrapper.vm.status = 'IN_PROGRESS';

    await wrapper.vm.handleSave();

    expect(issueService.modifyIssue).toHaveBeenCalledWith(
      'project-1',
      'issue-1',
      { title: 'New title', status: 'IN_PROGRESS' },
    );
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('does not save when loadingSave is true', async () => {
    wrapper.vm.title = 'New title';
    wrapper.vm.loadingSave = true;

    await wrapper.vm.handleSave();

    expect(issueService.modifyIssue).not.toHaveBeenCalled();
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('emits saved event after successful save', async () => {
    vi.spyOn(issueService, 'modifyIssue').mockResolvedValue(undefined);

    wrapper.vm.title = 'New title';
    await wrapper.vm.handleSave();

    expect(wrapper.emitted()).toHaveProperty('saved');
    expect(wrapper.emitted('saved')![0]).toEqual([]);
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('resets loadingSave to false after error', async () => {
    vi.spyOn(issueService, 'modifyIssue').mockRejectedValue(new Error('fail'));

    wrapper.vm.title = 'New title';
    await wrapper.vm.handleSave();

    expect(wrapper.vm.loadingSave).toBe(false);
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('updates all original values after save', async () => {
    vi.spyOn(issueService, 'modifyIssue').mockResolvedValue(undefined);

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
    wrapper.vm.tenancy = undefined as any;
    expect(wrapper.vm.canSave).toBe(true);
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('prevents concurrent saves', async () => {
    vi.spyOn(issueService, 'modifyIssue').mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    wrapper.vm.title = 'First';
    const promise1 = wrapper.vm.handleSave();
    const promise2 = wrapper.vm.handleSave();

    await Promise.all([promise1, promise2]);

    expect(issueService.modifyIssue).toHaveBeenCalledTimes(1);
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('handles very long title', async () => {
    vi.spyOn(issueService, 'modifyIssue').mockResolvedValue(undefined);

    const longTitle = 'A'.repeat(1000);
    wrapper.vm.title = longTitle;

    await wrapper.vm.handleSave();

    expect(issueService.modifyIssue).toHaveBeenCalledWith(
      'project-1',
      'issue-1',
      { title: longTitle },
    );
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('handles special characters in title', async () => {
    vi.spyOn(issueService, 'modifyIssue').mockResolvedValue(undefined);

    wrapper.vm.title = '<script>alert("XSS")</script>';

    await wrapper.vm.handleSave();

    expect(issueService.modifyIssue).toHaveBeenCalledWith(
      'project-1',
      'issue-1',
      { title: '<script>alert("XSS")</script>' },
    );
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('handles multiple field changes simultaneously', async () => {
    vi.spyOn(issueService, 'modifyIssue').mockResolvedValue(undefined);

    wrapper.vm.title = 'New title';
    wrapper.vm.status = 'CLOSED';
    wrapper.vm.issueType = 'DEFECT';
    wrapper.vm.ownerId = 'user-3';
    wrapper.vm.tenancy = 'tenant-3';

    await wrapper.vm.handleSave();

    expect(issueService.modifyIssue).toHaveBeenCalledWith(
      'project-1',
      'issue-1',
      {
        title: 'New title',
        status: 'CLOSED',
        type: 'DEFECT',
        ownerId: 'user-3',
        tenancy: 'tenant-3',
      },
    );
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('preserves field values after failed save', async () => {
    vi.spyOn(issueService, 'modifyIssue').mockRejectedValue(new Error('fail'));

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
    vi.spyOn(issueService, 'modifyIssue').mockResolvedValue(undefined);

    wrapper.vm.title = 'Updated';
    await wrapper.vm.handleSave();

    expect(addMock).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'success',
      }),
    );
  });
});
