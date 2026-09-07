import { describe, test, expect, beforeEach, vi, type Mock } from 'vitest';
import { mount, flushPromises, VueWrapper } from '@vue/test-utils';
import RentalAgreementIssueCard from '@/features/project/rentalAgreements/components/RentalAgreementIssueCard.vue';
import { issueService, type IssueItemJson } from '@/features/project/issues/services/IssueService';

const push = vi.fn();
vi.mock('vue-router', () => ({ useRouter: () => ({ push }) }));

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }));

const toastAddMock = vi.fn();
vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: toastAddMock }) }));

vi.mock('@/features/project/issues/services/IssueService', () => ({ issueService: { getIssues: vi.fn() } }));

const IssueTableStub = {
  props: ['issues', 'projectId', 'columns'],
  emits: ['rowSelect'],
  template: '<div class="issue-table-stub" />',
};

describe('RentalAgreementIssueCard', () => {
  let wrapper: VueWrapper;

  const sampleIssue: IssueItemJson = {
    id: 'issue-1',
    title: 'Broken window',
    status: 'OPEN',
  } as IssueItemJson;

  const mountCard = (props = {}) =>
    mount(RentalAgreementIssueCard, {
      props: {
        projectId: 'project-1', agreementId: 'agreement-1', ...props 
      },
      global: {
        stubs: {
          BaseCard: { template: '<div><slot name="title" /><slot name="content" /></div>' },
          IssueTable: IssueTableStub,
        },
      },
    });

  beforeEach(() => {
    vi.clearAllMocks();
    (issueService.getIssues as Mock).mockResolvedValue({ issues: [sampleIssue] });
  });

  test('renders component', () => {
    wrapper = mountCard();
    expect(wrapper.exists()).toBe(true);
  });

  test('loads issues filtered by projectId and agreementId', async () => {
    wrapper = mountCard({ agreementId: 'agreement-2' });
    await flushPromises();

    expect(issueService.getIssues).toHaveBeenCalledWith(
      'project-1',
      undefined,
      undefined,
      undefined,
      'agreement-2',
      undefined,
      undefined,
    );
    expect(wrapper.findComponent(IssueTableStub).props('issues')).toEqual([sampleIssue]);
  });

  test('uses the fixed column set', async () => {
    wrapper = mountCard();
    await flushPromises();

    expect(wrapper.findComponent(IssueTableStub).props('columns')).toEqual([
      'issueNumber',
      'title',
      'type',
      'status',
      'assignee',
      'modifiedAt',
    ]);
  });

  test('logs an error, shows a toast and keeps the issue list empty when loading fails', async () => {
    (issueService.getIssues as Mock).mockRejectedValue(new Error('network error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    wrapper = mountCard();
    await flushPromises();

    expect(consoleSpy).toHaveBeenCalledWith('Failed to load issues:', expect.any(Error));
    expect(toastAddMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    expect(wrapper.findComponent(IssueTableStub).props('issues')).toEqual([]);
    consoleSpy.mockRestore();
  });

  test('navigates to issue details on row select', async () => {
    wrapper = mountCard();
    await flushPromises();

    await wrapper.findComponent(IssueTableStub).vm.$emit('rowSelect', sampleIssue);

    expect(push).toHaveBeenCalledWith({
      name: 'IssueDetails',
      params: { projectId: 'project-1', issueId: 'issue-1' },
    });
  });
});
