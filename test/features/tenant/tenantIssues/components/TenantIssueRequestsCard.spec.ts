import { describe, it, expect, vi, beforeEach } from 'vitest';
import { defineComponent } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';
import TenantIssueRequestsCard from '@/features/tenant/tenantIssues/components/TenantIssueRequestsCard.vue';
import { tenantIssueRequestService } from '@/features/tenant/tenantIssues/services/TenantIssueRequestService';
import type { IssueRequestJson } from '@/features/tenant/tenantIssues/services/TenantIssueRequestService';

const AnswerDialogStub = defineComponent({
  name: 'TenantIssueRequestAnswerDialog',
  props: {
    visible: { type: Boolean, default: false },
    issueId: { type: String, default: '' },
    request: { type: Object, default: null },
  },
  emits: ['update:visible', 'answered'],
  template: '<div data-testid="answer-dialog-stub" />',
});

const mockRequests: IssueRequestJson[] = [
  {
    issueRequestId: 'req-1', message: 'Bitte um Rückmeldung', createdAt: '2026-01-15T10:00:00.000Z' 
  },
  {
    issueRequestId: 'req-2', message: 'Bitte Foto senden', createdAt: '2026-01-16T10:00:00.000Z' 
  },
];

describe('TenantIssueRequestsCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mountCard = () => mount(TenantIssueRequestsCard, {
    props: { issueId: 'issue-1' },
    global: { stubs: { TenantIssueRequestAnswerDialog: AnswerDialogStub } },
  });

  it('calls getRequests on mount', async () => {
    vi.spyOn(tenantIssueRequestService, 'getRequests').mockResolvedValue([]);
    mountCard();
    await flushPromises();
    expect(tenantIssueRequestService.getRequests).toHaveBeenCalledWith('issue-1');
  });

  it('renders nothing once loaded when there are no requests', async () => {
    vi.spyOn(tenantIssueRequestService, 'getRequests').mockResolvedValue([]);
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.find('[data-testid="tenant-issue-requests-card"]').exists()).toBe(false);
  });

  it('shows the loading skeleton while the initial fetch is pending', () => {
    vi.spyOn(tenantIssueRequestService, 'getRequests').mockReturnValue(new Promise(() => {}));
    const wrapper = mountCard();
    expect(wrapper.find('[data-testid="tenant-issue-requests-card"]').exists()).toBe(true);
  });

  it('renders one row per request', async () => {
    vi.spyOn(tenantIssueRequestService, 'getRequests').mockResolvedValue(mockRequests);
    const wrapper = mountCard();
    await flushPromises();

    expect(wrapper.find('[data-testid="tenant-issue-request-req-1"]').text()).toContain('Bitte um Rückmeldung');
    expect(wrapper.find('[data-testid="tenant-issue-request-req-2"]').text()).toContain('Bitte Foto senden');
  });

  it('shows an error message and logs when getRequests fails', async () => {
    vi.spyOn(tenantIssueRequestService, 'getRequests').mockRejectedValue(new Error('network'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const wrapper = mountCard();
    await flushPromises();

    expect(wrapper.find('[data-testid="tenant-issue-requests-error"]').exists()).toBe(true);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('opens the answer dialog with the clicked request', async () => {
    vi.spyOn(tenantIssueRequestService, 'getRequests').mockResolvedValue(mockRequests);
    const wrapper = mountCard();
    await flushPromises();

    await wrapper.get('[data-testid="tenant-issue-request-req-2"]').trigger('click');

    const dialog = wrapper.getComponent(AnswerDialogStub);
    expect(dialog.props('visible')).toBe(true);
    expect(dialog.props('request')).toEqual(mockRequests[1]);
  });

  it('refetches requests when the dialog emits answered', async () => {
    const getSpy = vi.spyOn(tenantIssueRequestService, 'getRequests').mockResolvedValue(mockRequests);
    const wrapper = mountCard();
    await flushPromises();

    const dialog = wrapper.getComponent(AnswerDialogStub);
    dialog.vm.$emit('answered');
    await flushPromises();

    expect(getSpy).toHaveBeenCalledTimes(2);
  });
});
