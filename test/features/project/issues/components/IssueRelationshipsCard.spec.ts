import { describe, test, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import IssueRelationshipsCard from '@/features/project/issues/components/IssueRelationshipsCard.vue';
import { issueService, type IssueItemJson } from '@/services/IssueService';

const toastAddMock = vi.fn();

vi.mock('@/services/IssueService', () => ({
  issueService: {
    getIssues: vi.fn(),
    getIssue: vi.fn(),
    deleteIssueRelation: vi.fn(),
  },
}));

vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: toastAddMock }) }));
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }));

const projectIssues: IssueItemJson[] = [
  {
    id: 'related-1', title: 'Related issue', type: 'TASK' 
  },
  {
    id: 'blocker-1', title: 'Blocking issue', type: 'DEFECT' 
  },
];

describe('IssueRelationshipsCard.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(issueService, 'getIssues').mockResolvedValue({size: 2, issues: projectIssues});
    vi.spyOn(issueService, 'getIssue').mockResolvedValue({
      id: 'unknown-1', title: 'Unknown issue', type: 'TASK' 
    });
    vi.spyOn(issueService, 'deleteIssueRelation').mockResolvedValue();
  });

  const baseStubs = {
    BaseCard: { template: '<div><slot name="title" /><slot name="content" /></div>' },
    RouterLink: { props: ['to'], template: '<a :href="JSON.stringify(to)"><slot /></a>' },
    Button: {
      props: ['label', 'disabled', 'loading'],
      template: '<button :disabled="disabled" :data-loading="loading" @click="$emit(\'click\')">{{ label }}</button>',
    },
    AddIssueRelationDialog: {
      name: 'AddIssueRelationDialog',
      props: ['visible', 'issueId', 'projectIssues', 'excludedIds'],
      template: '<div data-test="add-dialog" :data-visible="String(visible)" @click="$emit(\'created\')" />',
    },
  };

  function mountCard(props: Record<string, unknown> = {}) {
    return mount(IssueRelationshipsCard, {
      props: {
        issueId: 'issue-0',
        projectId: 'project-0',
        ...props,
      },
      global: { stubs: baseStubs },
    });
  }

  test('shows empty state when there are no relations', async () => {
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.text()).toContain('issueDetails.relationshipsEmpty');
  });

  test('fetches project issues on mount', async () => {
    mountCard();
    await flushPromises();
    expect(issueService.getIssues).toHaveBeenCalledWith('project-0');
  });

  test('renders a related-to row resolved from the project issue list with title and type', async () => {
    const wrapper = mountCard({ relatedTo: ['related-1'] });
    await flushPromises();

    expect(wrapper.text()).toContain('Related issue');
    expect(wrapper.text()).toContain('issueType.task');
    expect(issueService.getIssue).not.toHaveBeenCalled();
  });

  test('falls back to fetching an unresolved related issue individually', async () => {
    const wrapper = mountCard({ blocks: ['unknown-1'] });
    await flushPromises();
    await flushPromises();

    expect(issueService.getIssue).toHaveBeenCalledWith('unknown-1');
    expect(wrapper.text()).toContain('Unknown issue');
  });

  test('removes a relation and emits saved on success', async () => {
    const wrapper = mountCard({ relatedTo: ['related-1'] });
    await flushPromises();

    const deleteButton = wrapper.findAll('button').find((b) => b.text() === 'button.delete');
    await deleteButton?.trigger('click');
    await flushPromises();

    expect(issueService.deleteIssueRelation).toHaveBeenCalledWith('issue-0', 'related-to', 'related-1');
    expect(toastAddMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
    expect(wrapper.emitted('saved')).toBeTruthy();
  });

  test('shows error toast when removing a relation fails', async () => {
    vi.spyOn(issueService, 'deleteIssueRelation').mockRejectedValue(new Error('boom'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const wrapper = mountCard({ blocks: ['blocker-1'] });
    await flushPromises();

    const deleteButton = wrapper.findAll('button').find((b) => b.text() === 'button.delete');
    await deleteButton?.trigger('click');
    await flushPromises();

    expect(toastAddMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    expect(wrapper.emitted('saved')).toBeFalsy();
    consoleSpy.mockRestore();
  });

  test('opens the add-relation dialog and treats "created" as saved', async () => {
    const wrapper = mountCard();
    await flushPromises();

    const addButton = wrapper.findAll('button').find((b) => b.text() === 'issueDetails.relationshipsAddButton');
    await addButton?.trigger('click');
    await wrapper.vm.$nextTick();

    const dialog = wrapper.find('[data-test="add-dialog"]');
    expect(dialog.attributes('data-visible')).toBe('true');

    await dialog.trigger('click');
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('saved')).toBeTruthy();
    expect(dialog.attributes('data-visible')).toBe('false');
  });

  test('excludes the current issue and all existing relation ids from the dialog', async () => {
    const wrapper = mountCard({
      relatedTo: ['related-1'],
      blocks: ['blocker-1'],
    });
    await flushPromises();

    const dialogEl = wrapper.getComponent({ name: 'AddIssueRelationDialog' });
    const excluded = dialogEl.props('excludedIds') as Set<string>;
    expect(excluded.has('issue-0')).toBe(true);
    expect(excluded.has('related-1')).toBe(true);
    expect(excluded.has('blocker-1')).toBe(true);
  });
});
