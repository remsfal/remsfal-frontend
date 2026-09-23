import { describe, it, expect, vi, beforeEach } from 'vitest';
import { defineComponent } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';
import FileUpload from 'primevue/fileupload';
import TenantIssueRequestAnswerDialog from '@/features/tenant/tenantIssues/components/TenantIssueRequestAnswerDialog.vue';
import { tenantIssueRequestService } from '@/features/tenant/tenantIssues/services/TenantIssueRequestService';
import type { IssueRequestJson } from '@/features/tenant/tenantIssues/services/TenantIssueRequestService';

const addMock = vi.fn();
vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: addMock }) }));

// PrimeVue's real Dialog teleports its content and gates rendering behind transition
// state, so (matching the convention already used in TenantIssueDetailView.spec.ts)
// BaseDialog is stubbed to render its slots directly whenever `visible` is true.
const BaseDialogStub = defineComponent({
  name: 'BaseDialog',
  props: {
    visible: { type: Boolean, default: false },
    header: { type: String, default: '' },
  },
  emits: ['update:visible'],
  template: `
    <div v-if="visible" data-testid="answer-dialog">
      <slot />
      <slot name="footer" />
    </div>
  `,
});

const makeFile = (name: string, size = 3, lastModified = 1) =>
  new File(['x'.repeat(size)], name, { type: 'image/png', lastModified });

const mockRequest: IssueRequestJson = {
  issueRequestId: 'req-1',
  message: 'Bitte um Rückmeldung',
};

describe('TenantIssueRequestAnswerDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mountDialog = (request: IssueRequestJson | null = mockRequest, visible = true) => mount(
    TenantIssueRequestAnswerDialog,
    {
      props: {
        visible, issueId: 'issue-1', request 
      },
      global: { stubs: { BaseDialog: BaseDialogStub } },
    },
  );

  it('renders the original request message', () => {
    const wrapper = mountDialog();
    expect(wrapper.get('[data-testid="request-answer-original-message"]').text()).toBe('Bitte um Rückmeldung');
  });

  it('does not render the original message block when request is null', () => {
    const wrapper = mountDialog(null);
    expect(wrapper.find('[data-testid="request-answer-original-message"]').exists()).toBe(false);
  });

  it('disables the submit button when the message is empty', () => {
    const wrapper = mountDialog();
    expect(wrapper.get('[data-testid="request-answer-submit"]').attributes('disabled')).toBeDefined();
  });

  it('disables the submit button when the message is whitespace only', async () => {
    const wrapper = mountDialog();
    await wrapper.get('[data-testid="request-answer-message-input"]').setValue('   ');
    expect(wrapper.get('[data-testid="request-answer-submit"]').attributes('disabled')).toBeDefined();
  });

  it('sends the trimmed message and files, shows success toast, and resets state', async () => {
    const answerSpy = vi.spyOn(tenantIssueRequestService, 'answerRequest').mockResolvedValue(undefined);
    const wrapper = mountDialog();

    await wrapper.get('[data-testid="request-answer-message-input"]').setValue('  Anbei die Antwort  ');
    await wrapper.get('[data-testid="request-answer-submit"]').trigger('click');
    await flushPromises();

    expect(answerSpy).toHaveBeenCalledWith('issue-1', 'req-1', { message: 'Anbei die Antwort' }, []);
    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
    expect(wrapper.emitted('answered')).toHaveLength(1);
    expect(wrapper.emitted('update:visible')?.at(-1)).toEqual([false]);
  });

  it('shows an error toast and keeps the dialog open with the message preserved on failure', async () => {
    vi.spyOn(tenantIssueRequestService, 'answerRequest').mockRejectedValue(new Error('network'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const wrapper = mountDialog();

    await wrapper.get('[data-testid="request-answer-message-input"]').setValue('Anbei die Antwort');
    await wrapper.get('[data-testid="request-answer-submit"]').trigger('click');
    await flushPromises();

    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    expect(wrapper.emitted('answered')).toBeUndefined();
    expect(wrapper.emitted('update:visible')).toBeUndefined();
    expect((wrapper.get('[data-testid="request-answer-message-input"]').element as HTMLTextAreaElement).value)
      .toBe('Anbei die Antwort');
    consoleSpy.mockRestore();
  });

  it('closes without submitting when Cancel is clicked', async () => {
    const answerSpy = vi.spyOn(tenantIssueRequestService, 'answerRequest');
    const wrapper = mountDialog();

    await wrapper.get('[data-testid="request-answer-message-input"]').setValue('Entwurf');
    const cancelButton = wrapper.findAll('button').find((b) => b.text() === 'Abbrechen');
    await cancelButton!.trigger('click');

    expect(answerSpy).not.toHaveBeenCalled();
    expect(wrapper.emitted('update:visible')?.at(-1)).toEqual([false]);
  });

  it('resets stale text when reopened', async () => {
    const wrapper = mountDialog(mockRequest, true);
    await wrapper.get('[data-testid="request-answer-message-input"]').setValue('Alter Entwurf');

    await wrapper.setProps({ visible: false });
    await wrapper.setProps({ visible: true });
    await flushPromises();

    expect((wrapper.get('[data-testid="request-answer-message-input"]').element as HTMLTextAreaElement).value)
      .toBe('');
  });

  it('enables submit when only files are selected and sends them with an empty message', async () => {
    const answerSpy = vi.spyOn(tenantIssueRequestService, 'answerRequest').mockResolvedValue(undefined);
    const wrapper = mountDialog();
    const photo = makeFile('photo.png');

    wrapper.getComponent(FileUpload).vm.$emit('select', { originalEvent: new Event('change'), files: [photo] });
    await flushPromises();

    expect(wrapper.get('[data-testid="request-answer-submit"]').attributes('disabled')).toBeUndefined();

    await wrapper.get('[data-testid="request-answer-submit"]').trigger('click');
    await flushPromises();

    expect(answerSpy).toHaveBeenCalledWith('issue-1', 'req-1', { message: '' }, [photo]);
  });

  it('merges repeated file selections without duplicates', async () => {
    const answerSpy = vi.spyOn(tenantIssueRequestService, 'answerRequest').mockResolvedValue(undefined);
    const wrapper = mountDialog();
    const first = makeFile('a.png', 3, 1);
    const firstAgain = makeFile('a.png', 3, 1);
    const second = makeFile('b.png', 5, 2);

    const upload = wrapper.getComponent(FileUpload);
    upload.vm.$emit('select', { originalEvent: new Event('change'), files: [first] });
    upload.vm.$emit('select', { originalEvent: new Event('change'), files: [firstAgain, second] });
    await flushPromises();

    await wrapper.get('[data-testid="request-answer-submit"]').trigger('click');
    await flushPromises();

    expect(answerSpy).toHaveBeenCalledWith('issue-1', 'req-1', { message: '' }, [firstAgain, second]);
  });

  it('ignores a select event without a files array', async () => {
    const wrapper = mountDialog();

    wrapper.getComponent(FileUpload).vm.$emit('select', { originalEvent: new Event('change'), files: null });
    await flushPromises();

    expect(wrapper.get('[data-testid="request-answer-submit"]').attributes('disabled')).toBeDefined();
  });

  it('does not submit when the request has no issueRequestId', async () => {
    const answerSpy = vi.spyOn(tenantIssueRequestService, 'answerRequest');
    const wrapper = mountDialog({ message: 'Ohne ID' });

    await wrapper.get('[data-testid="request-answer-message-input"]').setValue('Antwort');
    await wrapper.get('[data-testid="request-answer-submit"]').trigger('click');
    await flushPromises();

    expect(answerSpy).not.toHaveBeenCalled();
    expect(wrapper.emitted('answered')).toBeUndefined();
  });

  it('disables the inputs while the answer is being sent', async () => {
    let resolveAnswer: () => void = () => {};
    vi.spyOn(tenantIssueRequestService, 'answerRequest').mockReturnValue(
      new Promise<void>((resolve) => { resolveAnswer = resolve; }),
    );
    const wrapper = mountDialog();

    await wrapper.get('[data-testid="request-answer-message-input"]').setValue('Antwort');
    await wrapper.get('[data-testid="request-answer-submit"]').trigger('click');

    expect(wrapper.get('[data-testid="request-answer-message-input"]').attributes('disabled')).toBeDefined();
    expect(wrapper.get('[data-testid="request-answer-submit"]').attributes('disabled')).toBeDefined();

    resolveAnswer();
    await flushPromises();

    expect(wrapper.emitted('answered')).toHaveLength(1);
  });

  it('forwards visibility changes from the dialog', async () => {
    const wrapper = mountDialog();

    wrapper.getComponent(BaseDialogStub).vm.$emit('update:visible', false);
    await flushPromises();

    expect(wrapper.emitted('update:visible')?.at(-1)).toEqual([false]);
  });
});
