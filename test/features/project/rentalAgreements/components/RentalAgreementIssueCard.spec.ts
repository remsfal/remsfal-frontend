import { describe, test, expect, beforeEach, vi, type Mock } from 'vitest';
import { mount, flushPromises, VueWrapper } from '@vue/test-utils';
import RentalAgreementIssueCard from '@/features/project/rentalAgreements/components/RentalAgreementIssueCard.vue';
import { issueService, type IssueItemJson } from '@/services/IssueService';

const push = vi.fn();
vi.mock('vue-router', () => ({ useRouter: () => ({ push }) }));

vi.mock('vue-i18n', () => ({useI18n: () => ({ t: (key: string) => key }),}));

vi.mock('@/services/IssueService', () => ({issueService: { getIssues: vi.fn() },}));

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
      props: { projectId: 'project-1', ...props },
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

  test('forwards agreementId along with the other filters to getIssues', async () => {
    wrapper = mountCard({
      agreementId: 'agreement-1',
      assigneeId: 'assignee-1',
      status: 'OPEN',
      type: 'DEFECT',
    });
    await flushPromises();

    expect(issueService.getIssues).toHaveBeenCalledWith(
      'project-1',
      'OPEN',
      'DEFECT',
      'assignee-1',
      'agreement-1',
    );
    expect(wrapper.findComponent(IssueTableStub).props('issues')).toEqual([sampleIssue]);
  });

  test('uses title/status/priority columns for DEFECT type, title/assignee/status otherwise', async () => {
    wrapper = mountCard({ type: 'DEFECT' });
    await flushPromises();
    expect(wrapper.findComponent(IssueTableStub).props('columns')).toEqual([
      'title',
      'status',
      'priority',
    ]);

    await wrapper.setProps({ type: undefined });
    await flushPromises();
    expect(wrapper.findComponent(IssueTableStub).props('columns')).toEqual([
      'title',
      'assignee',
      'status',
    ]);
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
