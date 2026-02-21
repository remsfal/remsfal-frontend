import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import NewIssueDialog from '@/components/NewIssueDialog.vue';
import { issueService } from '@/services/IssueService';
import { Form } from '@primevue/forms';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Select from 'primevue/select';
import Message from 'primevue/message';

vi.mock('@/services/IssueService', { spy: true });

describe('NewIssueDialog.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof NewIssueDialog>>;

  beforeEach(() => {
    vi.spyOn(issueService, 'createProjectIssue').mockResolvedValue({
      id: 'issue-123',
      title: 'Test Issue',
      description: 'Test Description',
      type: 'TASK',
      status: 'PENDING',
      priority: 'MEDIUM',
    });

    wrapper = mount(NewIssueDialog, {
      props: {
        visible: true,
        projectId: 'project-123',
      },
      global: {
        stubs: {
          Dialog: { template: '<div><slot /></div>' },
          Button: { template: '<button type="button" @click="$emit(\'click\')"><slot /></button>' },
        },
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
    expect(selectButton.text()).toContain('Aufgaben');
  });

  it('defaults type to DEFECT when category="DEFECT"', async () => {
    const wrapperDefect = mount(NewIssueDialog, {
      props: {
        visible: true,
        projectId: 'project-123',
        category: 'DEFECT',
      },
      global: {
        stubs: {
          Dialog: { template: '<div><slot /></div>' },
          Button: { template: '<button @click="$emit(\'click\')"><slot /></button>' },
        },
        components: {
          Form, InputText, Textarea, Select, Message,
        },
      },
    });
    const selects = wrapperDefect.findAllComponents(Select);
    const issueTypeSelect = selects[0];
    const selectButton = issueTypeSelect.find('span.p-select-label');
    expect(selectButton.text()).toContain('Mängel');
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

  it('emits issueCreated event on success', async () => {
    const input = wrapper.find('input[name="issueTitle"]');
    await input.setValue('Valid Issue');

    const form = wrapper.findComponent(Form);
    await form.trigger('submit');

    await new Promise((resolve) => setTimeout(resolve, 50));
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('issueCreated')).toBeTruthy();
    expect(wrapper.emitted('update:visible')).toBeTruthy();
  });
});
