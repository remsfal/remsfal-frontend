import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import TenantCommunicationCard from '@/features/contractor/orderManagement/components/TenantCommunicationCard.vue';
import { issueRequestService } from '@/features/contractor/orderManagement/services/IssueRequestService';
import { useEventBus } from '@/stores/EventStore';

const addMock = vi.fn();
vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: addMock }) }));

describe('TenantCommunicationCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mountCard = () => mount(TenantCommunicationCard, { props: { issueId: 'issue-1' } });

  it('renders the card title "Mieter Kommunikation"', () => {
    const wrapper = mountCard();
    expect(wrapper.text()).toContain('Mieter Kommunikation');
  });

  it('disables the submit button when the message is empty', () => {
    const wrapper = mountCard();
    const button = wrapper.get('[data-testid="tenant-communication-message-submit"]');
    expect(button.attributes('disabled')).toBeDefined();
  });

  it('disables the submit button when the message is whitespace only', async () => {
    const wrapper = mountCard();
    await wrapper.get('[data-testid="tenant-communication-message-input"]').setValue('   ');
    const button = wrapper.get('[data-testid="tenant-communication-message-submit"]');
    expect(button.attributes('disabled')).toBeDefined();
  });

  it('sends the trimmed message, clears the field and shows a success toast', async () => {
    const createSpy = vi.spyOn(issueRequestService, 'createRequest').mockResolvedValue(undefined);
    const wrapper = mountCard();

    await wrapper.get('[data-testid="tenant-communication-message-input"]').setValue('  Bitte um Rückmeldung  ');
    await wrapper.get('[data-testid="tenant-communication-message-submit"]').trigger('click');
    await flushPromises();

    expect(createSpy).toHaveBeenCalledWith('issue-1', { message: 'Bitte um Rückmeldung' });
    expect((wrapper.get('[data-testid="tenant-communication-message-input"]').element as HTMLTextAreaElement).value)
      .toBe('');
    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
  });

  it('emits issueRequest:created on the event bus after a successful send', async () => {
    vi.spyOn(issueRequestService, 'createRequest').mockResolvedValue(undefined);
    const eventBus = useEventBus();
    const handler = vi.fn();
    eventBus.on('issueRequest:created', handler);
    const wrapper = mountCard();

    await wrapper.get('[data-testid="tenant-communication-message-input"]').setValue('Bitte um Rückmeldung');
    await wrapper.get('[data-testid="tenant-communication-message-submit"]').trigger('click');
    await flushPromises();

    expect(handler).toHaveBeenCalledWith({ issueId: 'issue-1' });
  });

  it('shows an error toast and keeps the message when the request fails', async () => {
    vi.spyOn(issueRequestService, 'createRequest').mockRejectedValue(new Error('network'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const wrapper = mountCard();

    await wrapper.get('[data-testid="tenant-communication-message-input"]').setValue('Bitte um Rückmeldung');
    await wrapper.get('[data-testid="tenant-communication-message-submit"]').trigger('click');
    await flushPromises();

    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    expect((wrapper.get('[data-testid="tenant-communication-message-input"]').element as HTMLTextAreaElement).value)
      .toBe('Bitte um Rückmeldung');
    consoleSpy.mockRestore();
  });
});
