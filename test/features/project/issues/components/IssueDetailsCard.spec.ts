import { describe, test, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import IssueDetailsCard from '@/features/project/issues/components/IssueDetailsCard.vue';
import Select from 'primevue/select';
import MemberAutoComplete from '@/components/MemberAutoComplete.vue';
import { issueService, type IssueJson } from '@/services/IssueService';
import { projectMemberService, type ProjectMemberListJson } from '@/services/ProjectMemberService';
import { organizationMemberService, type OrganizationMemberListJson } from '@/services/OrganizationMemberService';

// ─── Toast Mock ──────────────────────────────────────────────────────────────
const addMock = vi.fn();

vi.mock('primevue/usetoast', () => ({useToast: () => ({add: addMock,}),}));

// ─── Service Mock ────────────────────────────────────────────────────────────
vi.mock('@/services/IssueService', async () => {
  const actual = await vi.importActual<typeof import('@/services/IssueService')>('@/services/IssueService');
  return {
    ...actual,
    issueService: {updateIssue: vi.fn(),},
  };
});

// MemberAutoComplete (rendered as a real child) loads its own members via these services.
vi.mock('@/services/ProjectMemberService', async () => {
  const actual = await vi.importActual<typeof import('@/services/ProjectMemberService')>('@/services/ProjectMemberService');
  return {
    ...actual,
    projectMemberService: {getMembers: vi.fn(),},
  };
});

vi.mock('@/services/OrganizationMemberService', async () => {
  const actual = await vi.importActual<typeof import('@/services/OrganizationMemberService')>(
    '@/services/OrganizationMemberService',
  );
  return {
    ...actual,
    organizationMemberService: {getOrganizations: vi.fn(),},
  };
});

// ─── Test Helpers ────────────────────────────────────────────────────────────
function findSaveButton(w: VueWrapper) {
  const button = w.findAll('button').find((b) => b.text().includes('Speichern'));
  if (!button) throw new Error('Save button not found');
  return button;
}

// ─── Test Data ───────────────────────────────────────────────────────────────
const baseProps: {
  projectId: string;
  issueId: string;
  initialData: {
    issueId: string;
    title: string;
    status: IssueJson['status'];
    assigneeId: string;
    reportedBy: string;
    project: string;
    issueType: IssueJson['type'];
    tenancy: string;
  };
} = {
  projectId: 'project-1',
  issueId: 'issue-1',
  initialData: {
    issueId: 'issue-1',
    title: 'Old title',
    status: 'OPEN',
    assigneeId: 'user-1',
    reportedBy: 'Jane Smith',
    project: 'Project A',
    issueType: 'TASK',
    tenancy: 'tenant-1',
  },
};

// ─── Test Suite ──────────────────────────────────────────────────────────────
describe('IssueDetailsCard.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof IssueDetailsCard>>;

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(projectMemberService, 'getMembers').mockResolvedValue({
      members: [
        {
          id: 'user-1', name: 'John Doe', email: 'john@example.com', role: 'MANAGER',
        },
      ],
    } as ProjectMemberListJson);

    vi.spyOn(organizationMemberService, 'getOrganizations')
      .mockResolvedValue({ organizations: [] } as OrganizationMemberListJson);

    wrapper = mount(IssueDetailsCard, {props: baseProps,});
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('renders issue title in card header', () => {
    expect(wrapper.text()).toContain('Old title');
    expect(wrapper.text()).toContain('Vorgangs-ID');
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('save button is disabled when no changes are made', async () => {
    await nextTick();
    expect(findSaveButton(wrapper).attributes('disabled')).toBeDefined();
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('enables save button when title changes', async () => {
    await wrapper.find('#issue-title').setValue('New title');
    expect(findSaveButton(wrapper).attributes('disabled')).toBeUndefined();
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('calls updateIssue and shows success toast on save', async () => {
    vi.spyOn(issueService, 'updateIssue').mockResolvedValue({});

    await wrapper.find('#issue-title').setValue('Updated title');

    await findSaveButton(wrapper).trigger('click');
    await flushPromises();

    expect(issueService.updateIssue).toHaveBeenCalledWith(
      'issue-1',
      { title: 'Updated title' },
    );

    expect(addMock).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'success',
        summary: expect.any(String),
        detail: expect.any(String),
      }),
    );
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('shows error toast when API call fails', async () => {
    vi.spyOn(issueService, 'updateIssue').mockRejectedValue(new Error('fail'));

    await wrapper.find('#issue-title').setValue('Broken title');

    await findSaveButton(wrapper).trigger('click');
    await flushPromises();

    expect(addMock).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'error',
        summary: 'Fehler',
        detail: 'Fehler beim Speichern der Aufgabendetails',
      }),
    );
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('sets loadingSave during save', async () => {
    let resolveUpdate!: (value: IssueJson) => void;
    vi.spyOn(issueService, 'updateIssue').mockImplementationOnce(
      () => new Promise<IssueJson>((resolve) => { resolveUpdate = resolve; }),
    );

    await wrapper.find('#issue-title').setValue('Updated title');
    const saveButton = findSaveButton(wrapper);

    const clickPromise = saveButton.trigger('click');
    await nextTick();
    // Button is disabled during the save either way (loadingSave=true), but the
    // loading spinner (bound directly to the `loading` prop = loadingSave) is the
    // signal that isn't also driven by canSave, so it's what actually pins down
    // loadingSave's own transition rather than the disabled attribute (which stays
    // true after a successful save anyway, since canSave flips to false too).
    expect(saveButton.attributes('disabled')).toBeDefined();
    expect(saveButton.classes()).toContain('p-button-loading');

    resolveUpdate({} as IssueJson);
    await clickPromise;
    await flushPromises();

    expect(saveButton.classes()).not.toContain('p-button-loading');
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('updates original values after successful save', async () => {
    vi.spyOn(issueService, 'updateIssue').mockResolvedValue({});

    await wrapper.find('#issue-title').setValue('Updated title');

    await findSaveButton(wrapper).trigger('click');
    await flushPromises();

    expect(findSaveButton(wrapper).attributes('disabled')).toBeDefined();
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('does not call API when no changes are made', async () => {
    await findSaveButton(wrapper).trigger('click');
    await flushPromises();

    expect(issueService.updateIssue).not.toHaveBeenCalled();
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('detects change in status field', async () => {
    await wrapper.findAllComponents(Select)[0].vm.$emit('update:modelValue', 'CLOSED');
    await nextTick();

    expect(findSaveButton(wrapper).attributes('disabled')).toBeUndefined();
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('detects change in assigneeId field', async () => {
    await wrapper.findComponent(MemberAutoComplete).vm.$emit('update:modelValue', 'user-2');
    await nextTick();

    expect(findSaveButton(wrapper).attributes('disabled')).toBeUndefined();
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('detects change in issueType field', async () => {
    await wrapper.findAllComponents(Select)[1].vm.$emit('update:modelValue', 'DEFECT');
    await nextTick();

    expect(findSaveButton(wrapper).attributes('disabled')).toBeUndefined();
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('detects change in tenancy field', async () => {
    await wrapper.find('#issue-tenancy').setValue('tenant-2');

    expect(findSaveButton(wrapper).attributes('disabled')).toBeUndefined();
  });


  // ───────────────────────────────────────────────────────────────────────────
  test('includes only changed fields in API payload', async () => {
    vi.spyOn(issueService, 'updateIssue').mockResolvedValue({});

    await wrapper.find('#issue-title').setValue('New title');
    await wrapper.findAllComponents(Select)[0].vm.$emit('update:modelValue', 'IN_PROGRESS');
    await nextTick();

    await findSaveButton(wrapper).trigger('click');
    await flushPromises();

    expect(issueService.updateIssue).toHaveBeenCalledWith(
      'issue-1',
      { title: 'New title', status: 'IN_PROGRESS' },
    );
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('emits saved event after successful save', async () => {
    vi.spyOn(issueService, 'updateIssue').mockResolvedValue({});

    await wrapper.find('#issue-title').setValue('New title');
    await findSaveButton(wrapper).trigger('click');
    await flushPromises();

    expect(wrapper.emitted()).toHaveProperty('saved');
    expect(wrapper.emitted('saved')![0]).toEqual([]);
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('resets loadingSave to false after error', async () => {
    vi.spyOn(issueService, 'updateIssue').mockRejectedValue(new Error('fail'));

    await wrapper.find('#issue-title').setValue('New title');
    await findSaveButton(wrapper).trigger('click');
    await flushPromises();

    expect(findSaveButton(wrapper).attributes('disabled')).toBeUndefined();
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('updates all original values after save', async () => {
    vi.spyOn(issueService, 'updateIssue').mockResolvedValue({});

    await wrapper.find('#issue-title').setValue('New title');
    await wrapper.findAllComponents(Select)[0].vm.$emit('update:modelValue', 'CLOSED');
    await nextTick();
    await wrapper.findAllComponents(Select)[1].vm.$emit('update:modelValue', 'DEFECT');
    await nextTick();

    await findSaveButton(wrapper).trigger('click');
    await flushPromises();

    expect(findSaveButton(wrapper).attributes('disabled')).toBeDefined();
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('handles empty string values', async () => {
    await wrapper.find('#issue-title').setValue('');

    expect(findSaveButton(wrapper).attributes('disabled')).toBeUndefined();
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('prevents concurrent saves', async () => {
    vi.spyOn(issueService, 'updateIssue').mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    await wrapper.find('#issue-title').setValue('First');
    const saveButton = findSaveButton(wrapper);

    const promise1 = saveButton.trigger('click');
    const promise2 = saveButton.trigger('click');

    await Promise.all([promise1, promise2]);

    expect(issueService.updateIssue).toHaveBeenCalledTimes(1);
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('handles very long title', async () => {
    vi.spyOn(issueService, 'updateIssue').mockResolvedValue({});

    const longTitle = 'A'.repeat(1000);
    await wrapper.find('#issue-title').setValue(longTitle);

    await findSaveButton(wrapper).trigger('click');
    await flushPromises();

    expect(issueService.updateIssue).toHaveBeenCalledWith(
      'issue-1',
      { title: longTitle },
    );
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('handles special characters in title', async () => {
    vi.spyOn(issueService, 'updateIssue').mockResolvedValue({});

    await wrapper.find('#issue-title').setValue('<script>alert("XSS")</script>');

    await findSaveButton(wrapper).trigger('click');
    await flushPromises();

    expect(issueService.updateIssue).toHaveBeenCalledWith(
      'issue-1',
      { title: '<script>alert("XSS")</script>' },
    );
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('preserves field values after failed save', async () => {
    vi.spyOn(issueService, 'updateIssue').mockRejectedValue(new Error('fail'));

    await wrapper.find('#issue-title').setValue('Failed title');
    await findSaveButton(wrapper).trigger('click');
    await flushPromises();

    expect(wrapper.find<HTMLInputElement>('#issue-title').element.value).toBe('Failed title');
    expect(findSaveButton(wrapper).attributes('disabled')).toBeUndefined();
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('shows correct toast message on successful save', async () => {
    vi.spyOn(issueService, 'updateIssue').mockResolvedValue({});

    await wrapper.find('#issue-title').setValue('Updated');
    await findSaveButton(wrapper).trigger('click');
    await flushPromises();

    expect(addMock).toHaveBeenCalledWith(
      expect.objectContaining({severity: 'success',}),
    );
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('displays reportedBy from initialData as reporter name', () => {
    expect(wrapper.find<HTMLInputElement>('#issue-reporter').element.value).toBe('Jane Smith');
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('shows noReporter fallback when reportedBy is empty', () => {
    const wrapperWithoutReporter = mount(IssueDetailsCard, {
      props: {
        ...baseProps,
        initialData: {
          ...baseProps.initialData,
          reportedBy: '',
        },
      },
    });

    expect(wrapperWithoutReporter.find<HTMLInputElement>('#issue-reporter').element.value).toBe('Kein Melder');
  });
});
