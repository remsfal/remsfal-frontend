import { describe, test, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper, flushPromises } from '@vue/test-utils';
import IssueAcceptButton from '@/features/project/issues/components/IssueAcceptButton.vue';
import { issueService, type IssueJson } from '@/services/IssueService';
import { useUserSessionStore } from '@/stores/UserSession';

// ─── Toast Mock ──────────────────────────────────────────────────────────────
const addMock = vi.fn();

vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: addMock }) }));

// ─── Service Mock ────────────────────────────────────────────────────────────
vi.mock('@/services/IssueService', async () => {
  const actual = await vi.importActual<typeof import('@/services/IssueService')>('@/services/IssueService');
  return {
    ...actual,
    issueService: { updateIssue: vi.fn() },
  };
});

// ─── Test Helpers ────────────────────────────────────────────────────────────
function findAcceptButton(w: VueWrapper) {
  const button = w.findAll('button').find((b) => b.text().includes('Anfrage übernehmen'));
  if (!button) throw new Error('Accept button not found');
  return button;
}

describe('IssueAcceptButton.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof IssueAcceptButton>>;
  let sessionStore: ReturnType<typeof useUserSessionStore>;

  beforeEach(() => {
    vi.clearAllMocks();

    sessionStore = useUserSessionStore();
    sessionStore.user = { id: 'user-1', email: 'manager@example.com' } as ReturnType<typeof useUserSessionStore>['user'];

    wrapper = mount(IssueAcceptButton, { props: { issueId: 'issue-1' } });
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('renders the accept button', () => {
    expect(findAcceptButton(wrapper)).toBeTruthy();
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('calls updateIssue with OPEN status and current user as assignee', async () => {
    vi.spyOn(issueService, 'updateIssue').mockResolvedValue({} as IssueJson);

    await findAcceptButton(wrapper).trigger('click');
    await flushPromises();

    expect(issueService.updateIssue).toHaveBeenCalledWith('issue-1', {
      status: 'OPEN',
      assigneeId: 'user-1',
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('shows success toast and emits accepted with the updated issue', async () => {
    const updatedIssue = {
      id: 'issue-1', status: 'OPEN', assigneeId: 'user-1' 
    } as IssueJson;
    vi.spyOn(issueService, 'updateIssue').mockResolvedValue(updatedIssue);

    await findAcceptButton(wrapper).trigger('click');
    await flushPromises();

    expect(addMock).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success' }),
    );
    expect(wrapper.emitted('accepted')).toBeTruthy();
    expect(wrapper.emitted('accepted')![0]).toEqual([updatedIssue]);
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('shows error toast and does not emit accepted on failure', async () => {
    vi.spyOn(issueService, 'updateIssue').mockRejectedValue(new Error('fail'));

    await findAcceptButton(wrapper).trigger('click');
    await flushPromises();

    expect(addMock).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error' }),
    );
    expect(wrapper.emitted('accepted')).toBeFalsy();
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('prevents concurrent accept requests', async () => {
    vi.spyOn(issueService, 'updateIssue').mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({} as IssueJson), 100)),
    );

    const button = findAcceptButton(wrapper);
    const promise1 = button.trigger('click');
    const promise2 = button.trigger('click');

    await Promise.all([promise1, promise2]);

    expect(issueService.updateIssue).toHaveBeenCalledTimes(1);
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('shows error toast and skips the API call when no user is logged in', async () => {
    sessionStore.user = null;
    vi.spyOn(issueService, 'updateIssue').mockResolvedValue({} as IssueJson);

    await findAcceptButton(wrapper).trigger('click');
    await flushPromises();

    expect(issueService.updateIssue).not.toHaveBeenCalled();
    expect(addMock).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error' }),
    );
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('sets loading state during the request', async () => {
    let resolveUpdate!: (value: IssueJson) => void;
    vi.spyOn(issueService, 'updateIssue').mockImplementationOnce(
      () => new Promise<IssueJson>((resolve) => { resolveUpdate = resolve; }),
    );

    const button = findAcceptButton(wrapper);
    const clickPromise = button.trigger('click');
    await flushPromises();

    expect(button.classes()).toContain('p-button-loading');

    resolveUpdate({} as IssueJson);
    await clickPromise;
    await flushPromises();

    expect(button.classes()).not.toContain('p-button-loading');
  });
});
