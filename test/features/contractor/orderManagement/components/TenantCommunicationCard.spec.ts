import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import FileUpload from 'primevue/fileupload';
import TenantCommunicationCard from '@/features/contractor/orderManagement/components/TenantCommunicationCard.vue';
import { issueRequestService } from '@/features/contractor/orderManagement/services/IssueRequestService';
import { useEventBus } from '@/stores/EventStore';

const addMock = vi.fn();
vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: addMock }) }));

const makeFile = (name: string, size = 3, lastModified = 1) =>
  new File(['x'.repeat(size)], name, { type: 'image/png', lastModified });

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

    expect(createSpy).toHaveBeenCalledWith('issue-1', { message: 'Bitte um Rückmeldung' }, []);
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

  const messageInput = (wrapper: ReturnType<typeof mountCard>) =>
    wrapper.get('[data-testid="tenant-communication-message-input"]');
  const submitButton = (wrapper: ReturnType<typeof mountCard>) =>
    wrapper.get('[data-testid="tenant-communication-message-submit"]');
  const selectFiles = (wrapper: ReturnType<typeof mountCard>, files: unknown) =>
    wrapper.getComponent(FileUpload).vm.$emit('select', { originalEvent: new Event('change'), files });

  it('sends the selected files together with the message', async () => {
    const createSpy = vi.spyOn(issueRequestService, 'createRequest').mockResolvedValue(undefined);
    const wrapper = mountCard();
    const photo = makeFile('photo.png');

    selectFiles(wrapper, [photo]);
    await messageInput(wrapper).setValue('Anbei ein Foto');
    await submitButton(wrapper).trigger('click');
    await flushPromises();

    expect(createSpy).toHaveBeenCalledWith('issue-1', { message: 'Anbei ein Foto' }, [photo]);
  });

  it('merges repeated file selections without duplicates', async () => {
    const createSpy = vi.spyOn(issueRequestService, 'createRequest').mockResolvedValue(undefined);
    const wrapper = mountCard();
    const first = makeFile('a.png', 3, 1);
    const firstAgain = makeFile('a.png', 3, 1);
    const second = makeFile('b.png', 5, 2);

    selectFiles(wrapper, [first]);
    selectFiles(wrapper, [firstAgain, second]);
    await messageInput(wrapper).setValue('Anbei');
    await submitButton(wrapper).trigger('click');
    await flushPromises();

    expect(createSpy).toHaveBeenCalledWith('issue-1', { message: 'Anbei' }, [firstAgain, second]);
  });

  it('ignores a select event without a files array', async () => {
    const createSpy = vi.spyOn(issueRequestService, 'createRequest').mockResolvedValue(undefined);
    const wrapper = mountCard();

    selectFiles(wrapper, null);
    await messageInput(wrapper).setValue('Anbei');
    await submitButton(wrapper).trigger('click');
    await flushPromises();

    expect(createSpy).toHaveBeenCalledWith('issue-1', { message: 'Anbei' }, []);
  });

  it('keeps the submit button disabled when only files are selected', async () => {
    const wrapper = mountCard();

    selectFiles(wrapper, [makeFile('photo.png')]);
    await flushPromises();

    expect(submitButton(wrapper).attributes('disabled')).toBeDefined();
  });

  it('clears the selected files after a successful send', async () => {
    const createSpy = vi.spyOn(issueRequestService, 'createRequest').mockResolvedValue(undefined);
    const wrapper = mountCard();

    selectFiles(wrapper, [makeFile('photo.png')]);
    await messageInput(wrapper).setValue('Erste Anfrage');
    await submitButton(wrapper).trigger('click');
    await flushPromises();

    await messageInput(wrapper).setValue('Zweite Anfrage');
    await submitButton(wrapper).trigger('click');
    await flushPromises();

    expect(createSpy).toHaveBeenLastCalledWith('issue-1', { message: 'Zweite Anfrage' }, []);
  });

  it('disables the inputs while the request is being sent', async () => {
    let resolveRequest: () => void = () => {};
    vi.spyOn(issueRequestService, 'createRequest').mockReturnValue(
      new Promise<void>((resolve) => { resolveRequest = resolve; }),
    );
    const wrapper = mountCard();

    await messageInput(wrapper).setValue('Bitte um Rückmeldung');
    await submitButton(wrapper).trigger('click');

    expect(messageInput(wrapper).attributes('disabled')).toBeDefined();
    expect(submitButton(wrapper).attributes('disabled')).toBeDefined();
    expect(wrapper.getComponent(FileUpload).props('disabled')).toBe(true);

    resolveRequest();
    await flushPromises();

    expect(messageInput(wrapper).attributes('disabled')).toBeUndefined();
  });
});
