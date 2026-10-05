import { describe, it, expect, vi, beforeEach, type MockInstance } from 'vitest';
import { defineComponent } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';
import FileUpload from 'primevue/fileupload';
import i18n from '@/i18n/i18n';
import TimelineEntryCard from '@/components/TimelineEntryCard.vue';
import TenantCommunicationCard from '@/features/contractor/orderManagement/components/TenantCommunicationCard.vue';
import {issueRequestService,
  type IssueRequestJson,} from '@/features/contractor/orderManagement/services/IssueRequestService';
import type { QuotationRequestJson } from '@/features/contractor/orderManagement/services/QuotationRequestService';
import { useEventBus } from '@/stores/EventStore';

const addMock = vi.fn();
vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: addMock }) }));

// PrimeVue's real Dialog teleports its content and gates rendering behind transition
// state, so BaseDialog is stubbed to render its slots directly whenever `visible` is true.
const BaseDialogStub = defineComponent({
  name: 'BaseDialog',
  props: {
    visible: { type: Boolean, default: false },
    header: { type: String, default: '' },
  },
  emits: ['update:visible'],
  template: `
    <div v-if="visible" data-testid="withdraw-request-dialog">
      <slot />
      <slot name="footer" />
    </div>
  `,
});

const makeFile = (name: string, size = 3, lastModified = 1) =>
  new File(['x'.repeat(size)], name, { type: 'image/png', lastModified });

describe('TenantCommunicationCard', () => {
  let getRequestsSpy: MockInstance<typeof issueRequestService.getRequests>;

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    getRequestsSpy = vi.spyOn(issueRequestService, 'getRequests').mockResolvedValue([]);
  });

  const mountCard = (request: QuotationRequestJson = { issueId: 'issue-1' }) =>
    mount(TenantCommunicationCard, {
      props: { issueId: 'issue-1', request },
      global: { stubs: { BaseDialog: BaseDialogStub } },
    });

  describe('tenant and rental unit info', () => {
    it('renders tenant name and phone without email, preferring the mobile number', () => {
      const wrapper = mountCard({
        tenants: [{
          id: 't-1', firstName: 'Max', lastName: 'Mieter', email: 'max@example.org',
          mobilePhoneNumber: '+491701234', privatePhoneNumber: '+49301111',
        }],
      });

      const names = wrapper.get('[data-testid="tenant-names"]');
      expect(names.text()).toContain(i18n.global.t('orderManagement.tenantCommunication.fields.tenant'));
      expect(names.text()).toContain('Max Mieter');
      const phones = wrapper.get('[data-testid="tenant-phones"]');
      expect(phones.text()).toContain(i18n.global.t('orderManagement.tenantCommunication.fields.phone'));
      expect(phones.find('a[href="tel:+491701234"]').exists()).toBe(true);
      expect(phones.text()).not.toContain('+49301111');
      expect(wrapper.text()).not.toContain('max@example.org');
    });

    it('lists several tenants comma separated in one row each', () => {
      const wrapper = mountCard({
        tenants: [
          {
            id: 't-1', name: 'Max Mieter', email: 'max@example.org', businessPhoneNumber: '+49302222',
          },
          {
            id: 't-2', name: 'Erika Muster', email: 'erika@example.org', privatePhoneNumber: '+49303333',
          },
        ],
      });

      expect(wrapper.get('[data-testid="tenant-names"]').text()).toContain('Max Mieter, Erika Muster');
      const phones = wrapper.get('[data-testid="tenant-phones"]');
      expect(phones.findAll('a')).toHaveLength(2);
      expect(phones.text()).toContain('+49302222, +49303333');
    });

    it('renders the place of performance and the location of the rental unit', () => {
      const wrapper = mountCard({
        placeOfPerformanceAddress1: 'Parkstraße 6',
        placeOfPerformanceAddress2: '14482 Potsdam',
        rentalUnitLocation: '2. OG links',
      });

      const address = wrapper.get('[data-testid="place-of-performance"]');
      expect(address.text()).toContain(i18n.global.t('orderManagement.tenantCommunication.fields.address'));
      expect(address.text()).toContain('Parkstraße 6, 14482 Potsdam');
      const location = wrapper.get('[data-testid="rental-unit-location"]');
      expect(location.text()).toContain(i18n.global.t('orderManagement.tenantCommunication.fields.rentalUnitLocation'));
      expect(location.text()).toContain('2. OG links');
    });

    it('renders the rental unit title and the translated unit type', () => {
      const wrapper = mountCard({
        rentalUnitTitle: 'Wohnung 3',
        rentalUnitType: 'APARTMENT',
      });

      const title = wrapper.get('[data-testid="rental-unit-title"]');
      expect(title.text()).toContain(i18n.global.t('orderManagement.tenantCommunication.fields.rentalUnit'));
      expect(title.text()).toContain('Wohnung 3');
      const type = wrapper.get('[data-testid="rental-unit-type"]');
      expect(type.text()).toContain(i18n.global.t('orderManagement.tenantCommunication.fields.rentalUnitType'));
      expect(type.text()).toContain(i18n.global.t('unitTypes.apartment'));
    });

    it('hides the info block when no tenant or rental unit data is provided', () => {
      const wrapper = mountCard();

      expect(wrapper.find('[data-testid="tenant-communication-info"]').exists()).toBe(false);
    });
  });

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

  it('enables submit when only files are selected and sends them with an empty message', async () => {
    const createSpy = vi.spyOn(issueRequestService, 'createRequest').mockResolvedValue(undefined);
    const wrapper = mountCard();
    const photo = makeFile('photo.png');

    selectFiles(wrapper, [photo]);
    await flushPromises();

    expect(submitButton(wrapper).attributes('disabled')).toBeUndefined();

    await submitButton(wrapper).trigger('click');
    await flushPromises();

    expect(createSpy).toHaveBeenCalledWith('issue-1', { message: '' }, [photo]);
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

  describe('open requests', () => {
    const openRequests: IssueRequestJson[] = [
      {
        issueRequestId: 'req-2', message: 'Zweite Anfrage', createdAt: '2026-10-02T10:00:00Z',
      },
      {
        issueRequestId: 'req-1', message: 'Erste Anfrage', createdAt: '2026-10-01T10:00:00Z',
        attachmentIds: ['att-1'],
        attachments: [{
          attachmentId: 'att-1',
          fileName: 'plan.pdf',
          contentType: 'application/pdf',
          downloadUrl: '/ticketing/v1/order-management/issue-1/attachments/att-1/plan.pdf',
        }],
      },
    ];

    const entries = (wrapper: ReturnType<typeof mountCard>) =>
      wrapper.findAll('[data-testid="open-request-entry"]');

    it('loads the open requests of the issue and renders them oldest first with a withdraw button', async () => {
      getRequestsSpy.mockResolvedValue(openRequests);
      const wrapper = mountCard();
      await flushPromises();

      expect(getRequestsSpy).toHaveBeenCalledWith('issue-1');
      const section = wrapper.get('[data-testid="open-requests"]');
      expect(entries(wrapper)[0].text()).toContain(i18n.global.t('orderManagement.tenantCommunication.openRequestTitle'));
      expect(entries(wrapper)).toHaveLength(2);
      expect(entries(wrapper)[0].text()).toContain('Erste Anfrage');
      expect(entries(wrapper)[1].text()).toContain('Zweite Anfrage');
      expect(wrapper.findAll('[data-testid="withdraw-request-button"]')).toHaveLength(2);
      expect(section.find('span.w-40').exists()).toBe(false);
    });

    it('renders the attachments of a request as downloads', async () => {
      getRequestsSpy.mockResolvedValue(openRequests);
      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
      const wrapper = mountCard();
      await flushPromises();

      const downloadLabel = i18n.global.t('orderManagement.timeline.downloadAttachmentLabel');
      await entries(wrapper)[0].get(`button[aria-label="${downloadLabel}"]`).trigger('click');

      expect(openSpy).toHaveBeenCalledWith(
        '/ticketing/v1/order-management/issue-1/attachments/att-1/plan.pdf',
        '_blank',
        'noopener,noreferrer',
      );
    });

    it('passes file name and content type from the backend so images get a preview', async () => {
      getRequestsSpy.mockResolvedValue([{
        issueRequestId: 'req-3', message: 'Foto', createdAt: '2026-10-03T10:00:00Z',
        attachments: [
          {
            attachmentId: 'att-img',
            fileName: 'schaden.jpg',
            contentType: 'image/jpeg',
            downloadUrl: '/ticketing/v1/order-management/issue-1/attachments/att-img/schaden.jpg',
          },
          {
            attachmentId: 'att-no-url', fileName: 'missing.pdf', contentType: 'application/pdf' 
          },
        ],
      }]);
      const wrapper = mountCard();
      await flushPromises();

      expect(wrapper.getComponent(TimelineEntryCard).props('attachments')).toEqual([{
        attachmentId: 'att-img',
        contentType: 'image/jpeg',
        downloadUrl: '/ticketing/v1/order-management/issue-1/attachments/att-img/schaden.jpg',
        fileName: 'schaden.jpg',
      }]);
      expect(entries(wrapper)[0].find('img').exists()).toBe(true);
    });

    it('hides the open requests section when there are none', async () => {
      const wrapper = mountCard();
      await flushPromises();

      expect(wrapper.find('[data-testid="open-requests"]').exists()).toBe(false);
    });

    it('keeps the card usable when loading the open requests fails', async () => {
      getRequestsSpy.mockRejectedValue(new Error('network'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const wrapper = mountCard();
      await flushPromises();

      expect(wrapper.find('[data-testid="open-requests"]').exists()).toBe(false);
      expect(wrapper.find('[data-testid="tenant-communication-message-input"]').exists()).toBe(true);
      consoleSpy.mockRestore();
    });

    it('reloads the open requests after a request was sent', async () => {
      vi.spyOn(issueRequestService, 'createRequest').mockResolvedValue(undefined);
      const wrapper = mountCard();
      await flushPromises();
      getRequestsSpy.mockResolvedValue([openRequests[1]]);

      await messageInput(wrapper).setValue('Erste Anfrage');
      await submitButton(wrapper).trigger('click');
      await flushPromises();

      expect(getRequestsSpy).toHaveBeenCalledTimes(2);
      expect(entries(wrapper)).toHaveLength(1);
    });

    it('emits issueRequest:withdrawn on the event bus after a successful withdrawal', async () => {
      getRequestsSpy.mockResolvedValue(openRequests);
      vi.spyOn(issueRequestService, 'deleteRequest').mockResolvedValue(undefined);
      const handler = vi.fn();
      useEventBus().on('issueRequest:withdrawn', handler);
      const wrapper = mountCard();
      await flushPromises();

      await wrapper.findAll('[data-testid="withdraw-request-button"]')[0].trigger('click');
      await wrapper.get('[data-testid="withdraw-request-confirm"]').trigger('click');
      await flushPromises();

      expect(handler).toHaveBeenCalledWith({ issueId: 'issue-1' });
    });

    it('does not emit issueRequest:withdrawn when withdrawing fails', async () => {
      getRequestsSpy.mockResolvedValue(openRequests);
      vi.spyOn(issueRequestService, 'deleteRequest').mockRejectedValue(new Error('network'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const handler = vi.fn();
      useEventBus().on('issueRequest:withdrawn', handler);
      const wrapper = mountCard();
      await flushPromises();

      await wrapper.findAll('[data-testid="withdraw-request-button"]')[0].trigger('click');
      await wrapper.get('[data-testid="withdraw-request-confirm"]').trigger('click');
      await flushPromises();

      expect(handler).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('withdraws a request after confirmation and removes it from the list', async () => {
      getRequestsSpy.mockResolvedValue(openRequests);
      const deleteSpy = vi.spyOn(issueRequestService, 'deleteRequest').mockResolvedValue(undefined);
      const wrapper = mountCard();
      await flushPromises();

      expect(wrapper.find('[data-testid="withdraw-request-dialog"]').exists()).toBe(false);
      await wrapper.findAll('[data-testid="withdraw-request-button"]')[0].trigger('click');
      expect(wrapper.get('[data-testid="withdraw-request-dialog"]').text())
        .toContain(i18n.global.t('orderManagement.tenantCommunication.withdrawRequestConfirm'));

      await wrapper.get('[data-testid="withdraw-request-confirm"]').trigger('click');
      await flushPromises();

      expect(deleteSpy).toHaveBeenCalledWith('issue-1', 'req-1');
      expect(entries(wrapper)).toHaveLength(1);
      expect(entries(wrapper)[0].text()).toContain('Zweite Anfrage');
      expect(wrapper.find('[data-testid="withdraw-request-dialog"]').exists()).toBe(false);
      expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
    });

    it('does not withdraw the request when the dialog is cancelled', async () => {
      getRequestsSpy.mockResolvedValue(openRequests);
      const deleteSpy = vi.spyOn(issueRequestService, 'deleteRequest').mockResolvedValue(undefined);
      const wrapper = mountCard();
      await flushPromises();

      await wrapper.findAll('[data-testid="withdraw-request-button"]')[0].trigger('click');
      await wrapper.get('[data-testid="withdraw-request-cancel"]').trigger('click');

      expect(deleteSpy).not.toHaveBeenCalled();
      expect(wrapper.find('[data-testid="withdraw-request-dialog"]').exists()).toBe(false);
      expect(entries(wrapper)).toHaveLength(2);
    });

    it('shows an error toast and keeps the request when withdrawing fails', async () => {
      getRequestsSpy.mockResolvedValue(openRequests);
      vi.spyOn(issueRequestService, 'deleteRequest').mockRejectedValue(new Error('network'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const wrapper = mountCard();
      await flushPromises();

      await wrapper.findAll('[data-testid="withdraw-request-button"]')[0].trigger('click');
      await wrapper.get('[data-testid="withdraw-request-confirm"]').trigger('click');
      await flushPromises();

      expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
      expect(entries(wrapper)).toHaveLength(2);
      consoleSpy.mockRestore();
    });
  });
});
