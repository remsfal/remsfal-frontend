import { describe, test, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import AddIssueRelationDialog from '@/features/project/issues/components/AddIssueRelationDialog.vue';
import { issueService } from '@/services/IssueService';

const toastAddMock = vi.fn();

vi.mock('@/services/IssueService', () => ({
  issueService: {
    createIssueRelation: vi.fn(),
    setParentIssue: vi.fn(),
  },
}));

vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: toastAddMock }) }));
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }));

const projectIssues = [
  {
    id: 'issue-1', title: 'Broken window', type: 'DEFECT' 
  },
  {
    id: 'issue-2', title: 'Replace lock', type: 'TASK' 
  },
  {
    id: 'issue-3', title: 'Another defect', type: 'DEFECT' 
  },
];

describe('AddIssueRelationDialog.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(issueService, 'createIssueRelation').mockResolvedValue({});
    vi.spyOn(issueService, 'setParentIssue').mockResolvedValue({});
  });

  const baseStubs = {
    BaseDialog: {
      inheritAttrs: false,
      template: '<div data-test="dialog"><slot /></div>',
    },
    Select: {
      props: ['modelValue', 'options'],
      template:
        '<select data-test="relation-type" :value="modelValue"' +
        ' @change="$emit(\'update:modelValue\', $event.target.value)">' +
        '<option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>' +
        '</select>',
    },
    InputText: {
      props: ['modelValue'],
      template:
        '<input data-test="search-input" :value="modelValue"' +
        ' @input="$emit(\'update:modelValue\', $event.target.value)" />',
    },
    Listbox: {
      props: ['modelValue', 'options'],
      template:
        '<div data-test="listbox">' +
        '<button v-for="opt in options" :key="opt.id" :data-test="\'option-\' + opt.id"' +
        ' @click="$emit(\'update:modelValue\', opt)">{{ opt.title }}</button>' +
        '</div>',
    },
    Button: {
      props: ['label', 'disabled', 'loading'],
      template: '<button :disabled="disabled" @click="$emit(\'click\')"><slot />{{ label }}</button>',
    },
  };

  function mountDialog(props: Record<string, unknown> = {}) {
    return mount(AddIssueRelationDialog, {
      props: {
        visible: true,
        issueId: 'issue-0',
        projectIssues,
        excludedIds: new Set<string>(),
        ...props,
      },
      global: { stubs: baseStubs },
    });
  }

  test('excludes issues already related and the current issue', () => {
    const wrapper = mountDialog({ excludedIds: new Set(['issue-0', 'issue-2']) });
    const listbox = wrapper.find('[data-test="listbox"]');
    expect(listbox.text()).toContain('Broken window');
    expect(listbox.text()).toContain('Another defect');
    expect(listbox.text()).not.toContain('Replace lock');
  });

  test('filters searchable issues by title', async () => {
    const wrapper = mountDialog();
    await wrapper.find('[data-test="search-input"]').setValue('lock');
    const listbox = wrapper.find('[data-test="listbox"]');
    expect(listbox.text()).toContain('Replace lock');
    expect(listbox.text()).not.toContain('Broken window');
  });

  test('filters searchable issues by id', async () => {
    const wrapper = mountDialog();
    await wrapper.find('[data-test="search-input"]').setValue('issue-3');
    const listbox = wrapper.find('[data-test="listbox"]');
    expect(listbox.text()).toContain('Another defect');
    expect(listbox.text()).not.toContain('Broken window');
  });

  test('creates a non-parent relation via createIssueRelation', async () => {
    const wrapper = mountDialog();
    await wrapper.find('[data-test="relation-type"]').setValue('related-to');
    await wrapper.find('[data-test="option-issue-1"]').trigger('click');
    const addButton = wrapper.findAll('button').find((b) => b.text().includes('button.add'));
    await addButton?.trigger('click');
    await flushPromises();

    expect(issueService.createIssueRelation).toHaveBeenCalledWith('issue-0', 'related-to', 'issue-1');
    expect(issueService.setParentIssue).not.toHaveBeenCalled();
    expect(wrapper.emitted('created')).toBeTruthy();
  });

  test('sets a parent relation via setParentIssue', async () => {
    const wrapper = mountDialog();
    await wrapper.find('[data-test="relation-type"]').setValue('parent');
    await wrapper.find('[data-test="option-issue-2"]').trigger('click');
    const addButton = wrapper.findAll('button').find((b) => b.text().includes('button.add'));
    await addButton?.trigger('click');
    await flushPromises();

    expect(issueService.setParentIssue).toHaveBeenCalledWith('issue-0', 'issue-2');
    expect(issueService.createIssueRelation).not.toHaveBeenCalled();
  });

  test('shows success toast and emits created on success', async () => {
    const wrapper = mountDialog();
    await wrapper.find('[data-test="relation-type"]').setValue('blocks');
    await wrapper.find('[data-test="option-issue-1"]').trigger('click');
    const addButton = wrapper.findAll('button').find((b) => b.text().includes('button.add'));
    await addButton?.trigger('click');
    await flushPromises();

    expect(toastAddMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
    expect(wrapper.emitted('created')).toBeTruthy();
  });

  test('shows error toast and does not emit created on failure', async () => {
    vi.spyOn(issueService, 'createIssueRelation').mockRejectedValue(new Error('boom'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const wrapper = mountDialog();
    await wrapper.find('[data-test="relation-type"]').setValue('blocks');
    await wrapper.find('[data-test="option-issue-1"]').trigger('click');
    const addButton = wrapper.findAll('button').find((b) => b.text().includes('button.add'));
    await addButton?.trigger('click');
    await flushPromises();

    expect(toastAddMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    expect(wrapper.emitted('created')).toBeFalsy();
    consoleSpy.mockRestore();
  });

  test('cancel button emits update:visible false', async () => {
    const wrapper = mountDialog();
    const cancelButton = wrapper.findAll('button').find((b) => b.text().includes('button.cancel'));
    await cancelButton?.trigger('click');

    expect(wrapper.emitted('update:visible')?.[0]).toEqual([false]);
  });
});
