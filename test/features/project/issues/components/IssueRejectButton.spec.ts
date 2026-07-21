import { describe, test, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper, flushPromises } from '@vue/test-utils';
import IssueRejectButton from '@/features/project/issues/components/IssueRejectButton.vue';
import { issueService, type IssueJson } from '@/services/IssueService';
import { issueTimelineService } from '@/services/IssueTimelineService';
import { useUserSessionStore } from '@/stores/UserSession';

// ─── Toast Mock ──────────────────────────────────────────────────────────────
const addMock = vi.fn();

vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: addMock }) }));

// ─── Service Mocks ───────────────────────────────────────────────────────────
vi.mock('@/services/IssueService', async () => {
  const actual = await vi.importActual<typeof import('@/services/IssueService')>('@/services/IssueService');
  return {
    ...actual,
    issueService: { updateIssue: vi.fn() },
  };
});

vi.mock('@/services/IssueTimelineService', async () => {
  const actual = await vi.importActual<typeof import('@/services/IssueTimelineService')>(
    '@/services/IssueTimelineService',
  );
  return {
    ...actual,
    issueTimelineService: { createTimelineEntry: vi.fn() },
  };
});

// ─── BaseDialog Stub ─────────────────────────────────────────────────────────
// Always renders slot content so dialog fields are accessible without simulating
// PrimeVue's real Teleport/Dialog behavior — matches NewContractorButton.spec.ts.
const BaseDialogStub = {
  name: 'BaseDialog',
  inheritAttrs: false,
  template: '<div data-testid="dialog" :data-visible="String($attrs.visible)"><slot /><slot name="footer" /></div>',
};

// ─── Test Helpers ────────────────────────────────────────────────────────────
function findRejectButton(w: VueWrapper) {
  const button = w.findAll('button').find((b) => b.text().includes('Anfrage ablehnen'));
  if (!button) throw new Error('Reject button not found');
  return button;
}

function findSubmitButton(w: VueWrapper) {
  const button = w.findAll('button').find((b) => b.text().includes('Absenden'));
  if (!button) throw new Error('Submit button not found');
  return button;
}

function findCancelButton(w: VueWrapper) {
  const button = w.findAll('button').find((b) => b.text() === 'Abbrechen');
  if (!button) throw new Error('Cancel button not found');
  return button;
}

describe('IssueRejectButton.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof IssueRejectButton>>;
  let sessionStore: ReturnType<typeof useUserSessionStore>;

  beforeEach(() => {
    vi.clearAllMocks();

    sessionStore = useUserSessionStore();
    sessionStore.user = { id: 'user-1', email: 'manager@example.com' } as ReturnType<typeof useUserSessionStore>['user'];

    wrapper = mount(IssueRejectButton, {
      props: { issueId: 'issue-1' },
      global: { stubs: { BaseDialog: BaseDialogStub } },
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('dialog is initially not visible', () => {
    const dialog = wrapper.find('[data-testid="dialog"]');
    expect(dialog.attributes('data-visible')).toBe('false');
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('opens the dialog with an empty reason textarea', async () => {
    await findRejectButton(wrapper).trigger('click');
    await wrapper.vm.$nextTick();

    const dialog = wrapper.find('[data-testid="dialog"]');
    expect(dialog.attributes('data-visible')).toBe('true');
    expect(wrapper.find('#reject-reason').element).toHaveProperty('value', '');
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('cancel closes the dialog without calling any service', async () => {
    await findRejectButton(wrapper).trigger('click');
    await wrapper.vm.$nextTick();

    await findCancelButton(wrapper).trigger('click');
    await wrapper.vm.$nextTick();

    expect(wrapper.find('[data-testid="dialog"]').attributes('data-visible')).toBe('false');
    expect(issueService.updateIssue).not.toHaveBeenCalled();
    expect(issueTimelineService.createTimelineEntry).not.toHaveBeenCalled();
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('submit with a reason updates the issue and creates a timeline entry', async () => {
    const updatedIssue = {
      id: 'issue-1', status: 'REJECTED', assigneeId: 'user-1' 
    } as IssueJson;
    vi.spyOn(issueService, 'updateIssue').mockResolvedValue(updatedIssue);
    vi.spyOn(issueTimelineService, 'createTimelineEntry').mockResolvedValue({} as never);

    await findRejectButton(wrapper).trigger('click');
    await wrapper.vm.$nextTick();

    await wrapper.find('#reject-reason').setValue('Not applicable to this unit');
    await findSubmitButton(wrapper).trigger('click');
    await flushPromises();

    expect(issueService.updateIssue).toHaveBeenCalledWith('issue-1', {
      status: 'REJECTED',
      assigneeId: 'user-1',
    });
    expect(issueTimelineService.createTimelineEntry).toHaveBeenCalledWith(
      'issue-1', 'STATUS_CHANGED', 'Not applicable to this unit',
    );
    expect(wrapper.find('[data-testid="dialog"]').attributes('data-visible')).toBe('false');
    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
    expect(wrapper.emitted('rejected')).toBeTruthy();
    expect(wrapper.emitted('rejected')![0]).toEqual([updatedIssue]);
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('submit without a reason does not create a timeline entry', async () => {
    vi.spyOn(issueService, 'updateIssue').mockResolvedValue({} as IssueJson);

    await findRejectButton(wrapper).trigger('click');
    await wrapper.vm.$nextTick();

    await findSubmitButton(wrapper).trigger('click');
    await flushPromises();

    expect(issueService.updateIssue).toHaveBeenCalledWith('issue-1', {
      status: 'REJECTED',
      assigneeId: 'user-1',
    });
    expect(issueTimelineService.createTimelineEntry).not.toHaveBeenCalled();
    expect(wrapper.emitted('rejected')).toBeTruthy();
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('submit with a whitespace-only reason does not create a timeline entry', async () => {
    vi.spyOn(issueService, 'updateIssue').mockResolvedValue({} as IssueJson);

    await findRejectButton(wrapper).trigger('click');
    await wrapper.vm.$nextTick();

    await wrapper.find('#reject-reason').setValue('   ');
    await findSubmitButton(wrapper).trigger('click');
    await flushPromises();

    expect(issueTimelineService.createTimelineEntry).not.toHaveBeenCalled();
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('error during updateIssue shows an error toast and keeps the dialog open', async () => {
    vi.spyOn(issueService, 'updateIssue').mockRejectedValue(new Error('fail'));

    await findRejectButton(wrapper).trigger('click');
    await wrapper.vm.$nextTick();

    await findSubmitButton(wrapper).trigger('click');
    await flushPromises();

    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    expect(wrapper.find('[data-testid="dialog"]').attributes('data-visible')).toBe('true');
    expect(wrapper.emitted('rejected')).toBeFalsy();
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('error during createTimelineEntry shows an error toast and keeps the dialog open', async () => {
    vi.spyOn(issueService, 'updateIssue').mockResolvedValue({} as IssueJson);
    vi.spyOn(issueTimelineService, 'createTimelineEntry').mockRejectedValue(new Error('fail'));

    await findRejectButton(wrapper).trigger('click');
    await wrapper.vm.$nextTick();

    await wrapper.find('#reject-reason').setValue('Some reason');
    await findSubmitButton(wrapper).trigger('click');
    await flushPromises();

    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    expect(wrapper.find('[data-testid="dialog"]').attributes('data-visible')).toBe('true');
    expect(wrapper.emitted('rejected')).toBeFalsy();
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('shows error toast and skips the API call when no user is logged in', async () => {
    sessionStore.user = null;

    await findRejectButton(wrapper).trigger('click');
    await wrapper.vm.$nextTick();

    await findSubmitButton(wrapper).trigger('click');
    await flushPromises();

    expect(issueService.updateIssue).not.toHaveBeenCalled();
    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('reopening the dialog resets a previously entered reason', async () => {
    await findRejectButton(wrapper).trigger('click');
    await wrapper.vm.$nextTick();
    await wrapper.find('#reject-reason').setValue('Draft reason');

    await findCancelButton(wrapper).trigger('click');
    await wrapper.vm.$nextTick();

    await findRejectButton(wrapper).trigger('click');
    await wrapper.vm.$nextTick();

    expect(wrapper.find('#reject-reason').element).toHaveProperty('value', '');
  });
});
