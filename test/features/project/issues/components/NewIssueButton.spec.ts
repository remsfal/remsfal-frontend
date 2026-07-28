import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import NewIssueButton from '@/features/project/issues/components/NewIssueButton.vue';
import { issueService } from '@/services/IssueService';
import { Form } from '@primevue/forms';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Select from 'primevue/select';
import Message from 'primevue/message';

vi.mock('@/services/IssueService', { spy: true });

// Always render dialog content so form fields are accessible without needing to simulate open
const BaseDialogStub = {
  name: 'BaseDialog',
  inheritAttrs: false,
  template: '<div data-testid="dialog" :data-visible="String($attrs.visible)"><slot /></div>',
};

describe('NewIssueButton.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof NewIssueButton>>;

  beforeEach(() => {
    vi.spyOn(issueService, 'createProjectIssue').mockResolvedValue({
      id: 'issue-123',
      title: 'Test Issue',
      description: 'Test Description',
      type: 'TASK',
      status: 'PENDING',
      priority: 'MEDIUM',
    });

    wrapper = mount(NewIssueButton, {
      props: {projectId: 'project-123',},
      global: {
        stubs: {BaseDialog: BaseDialogStub,},
        components: {
          Form,
          InputText,
          Textarea,
          Select,
          Message,
        },
      },
    });
  });

  it('dialog is initially not visible', () => {
    const dialog = wrapper.find('[data-testid="dialog"]');
    expect(dialog.attributes('data-visible')).toBe('false');
  });

  it('dialog becomes visible when button is clicked', async () => {
    await wrapper.find('button').trigger('click');

    const dialog = wrapper.find('[data-testid="dialog"]');
    expect(dialog.attributes('data-visible')).toBe('true');
  });

  it('shows error when title is too short', async () => {
    const input = wrapper.find('input[name="issueTitle"]');
    await input.setValue('AB');
    await input.trigger('blur');

    await new Promise((resolve) => setTimeout(resolve, 50));
    await wrapper.vm.$nextTick();

    const errorMessage = wrapper.findComponent(Message);
    expect(errorMessage.exists()).toBe(true);
  });

  it('shows error when title exceeds maxLength', async () => {
    const input = wrapper.find('input[name="issueTitle"]');
    await input.setValue('a'.repeat(201));
    await input.trigger('blur');

    await new Promise((resolve) => setTimeout(resolve, 50));
    await wrapper.vm.$nextTick();

    const errorMessage = wrapper.findComponent(Message);
    expect(errorMessage.exists()).toBe(true);
    expect(errorMessage.text()).toContain('200');
  });

  it('disables submit button initially', async () => {
    const submitButton = wrapper.findAll('button').find((b) => b.attributes('type') === 'submit');
    expect(submitButton?.attributes('disabled')).toBeDefined();
  });

  it('defaults type to TASK when no category prop', async () => {
    const selects = wrapper.findAllComponents(Select);
    const issueTypeSelect = selects[0];
    const selectButton = issueTypeSelect.find('span.p-select-label');
    expect(selectButton.text()).toContain('Aufgabe');
  });

  it('defaults type to DEFECT when category="DEFECT"', async () => {
    const wrapperDefect = mount(NewIssueButton, {
      props: {
        projectId: 'project-123',
        category: 'DEFECT',
      },
      global: {
        stubs: {BaseDialog: BaseDialogStub,},
        components: {
          Form, InputText, Textarea, Select, Message,
        },
      },
    });
    const selects = wrapperDefect.findAllComponents(Select);
    const issueTypeSelect = selects[0];
    const selectButton = issueTypeSelect.find('span.p-select-label');
    expect(selectButton.text()).toContain('Mangel');
  });

  it('calls createIssue with correct data and emits events', async () => {
    const input = wrapper.find('input[name="issueTitle"]');
    await input.setValue('Valid Issue Title');

    const form = wrapper.findComponent(Form);
    await form.trigger('submit');

    await new Promise((resolve) => setTimeout(resolve, 50));
    await wrapper.vm.$nextTick();

    expect(issueService.createProjectIssue).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Valid Issue Title',
        type: 'TASK',
        priority: 'UNCLASSIFIED',
        projectId: 'project-123',
      }),
    );
  });

  it('emits issueCreated event and closes dialog on success', async () => {
    await wrapper.find('button').trigger('click');

    const input = wrapper.find('input[name="issueTitle"]');
    await input.setValue('Valid Issue');

    const form = wrapper.findComponent(Form);
    await form.trigger('submit');

    await new Promise((resolve) => setTimeout(resolve, 50));
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('issueCreated')).toBeTruthy();
    const dialog = wrapper.find('[data-testid="dialog"]');
    expect(dialog.attributes('data-visible')).toBe('false');
  });
});
