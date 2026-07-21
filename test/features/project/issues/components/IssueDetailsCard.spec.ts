import { describe, test, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import IssueDetailsCard from '@/features/project/issues/components/IssueDetailsCard.vue';
import IssueAcceptButton from '@/features/project/issues/components/IssueAcceptButton.vue';
import IssueRejectButton from '@/features/project/issues/components/IssueRejectButton.vue';
import Select from 'primevue/select';
import AutoComplete from 'primevue/autocomplete';
import MemberAutoComplete from '@/components/MemberAutoComplete.vue';
import { issueService, type IssueJson } from '@/services/IssueService';
import { projectMemberService, type ProjectMemberListJson } from '@/services/ProjectMemberService';
import { organizationMemberService, type OrganizationMemberListJson } from '@/services/OrganizationMemberService';
import { useUserSessionStore } from '@/stores/UserSession';

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

// IssueRejectButton (rendered as a real child) uses this to post the optional reject reason.
vi.mock('@/services/IssueTimelineService', async () => {
  const actual = await vi.importActual<typeof import('@/services/IssueTimelineService')>(
    '@/services/IssueTimelineService',
  );
  return {
    ...actual,
    issueTimelineService: {createTimelineEntry: vi.fn(),},
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
    category: IssueJson['category'];
    priority: IssueJson['priority'];
    modifiedAt?: IssueJson['modifiedAt'];
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
    category: 'GENERAL',
    priority: 'MEDIUM',
    modifiedAt: '2026-01-15T10:30:00Z',
  },
};

// ─── Test Suite ──────────────────────────────────────────────────────────────
describe('IssueDetailsCard.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof IssueDetailsCard>>;
  let sessionStore: ReturnType<typeof useUserSessionStore>;

  beforeEach(() => {
    vi.clearAllMocks();

    sessionStore = useUserSessionStore();
    sessionStore.user = { id: 'user-1', email: 'manager@example.com' } as ReturnType<typeof useUserSessionStore>['user'];

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
    expect(wrapper.text()).toContain('Ticketnummer');
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

  // ───────────────────────────────────────────────────────────────────────────
  test('resolves category to null and priority to undefined when initialData omits them', () => {
    const wrapperWithoutCategoryAndPriority = mount(IssueDetailsCard, {
      props: {
        ...baseProps,
        initialData: {
          ...baseProps.initialData,
          category: undefined as unknown as IssueJson['category'],
          priority: undefined as unknown as IssueJson['priority'],
        },
      },
    });

    const categoryAutoComplete = wrapperWithoutCategoryAndPriority.findAllComponents(AutoComplete)[0];
    const prioritySelect = wrapperWithoutCategoryAndPriority.findAllComponents(Select)[2];

    expect(categoryAutoComplete.props('modelValue')).toBeNull();
    expect(prioritySelect.props('modelValue')).toBeUndefined();
  });

  // ───────────────────────────────────────────────────────────────────────────
  test.each([
    ['DEFECT', 'Wasserschaden'],
    ['INQUIRY', 'Wohnungsgeberbestätigung'],
    ['MAINTENANCE', 'Gartenpflege'],
  ] as const)('offers %s-specific categories for %s issue type', async (issueType, expectedLabel) => {
    await wrapper.findAllComponents(Select)[1].vm.$emit('update:modelValue', issueType);
    await nextTick();

    const categoryAutoComplete = wrapper.findAllComponents(AutoComplete)[0];
    await categoryAutoComplete.vm.$emit('complete', { query: '' });
    await nextTick();

    const labels = categoryAutoComplete.props('suggestions')!.map((option: { label: string }) => option.label);
    expect(labels).toContain(expectedLabel);
    expect(labels).toContain('Sonstiges');
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('filters categories by query text', async () => {
    const categoryAutoComplete = wrapper.findAllComponents(AutoComplete)[0];
    await categoryAutoComplete.vm.$emit('complete', { query: 'sonst' });
    await nextTick();

    const labels = categoryAutoComplete.props('suggestions')!.map((option: { label: string }) => option.label);
    expect(labels).toEqual(['Sonstiges']);
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('resets category when issue type change event fires', async () => {
    await wrapper.findAllComponents(Select)[1].vm.$emit('change', { value: 'DEFECT' });
    await nextTick();

    const categoryAutoComplete = wrapper.findAllComponents(AutoComplete)[0];
    expect(categoryAutoComplete.props('modelValue')).toBeNull();
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('falls back to em dash when issueId is empty', () => {
    const wrapperWithoutIssueId = mount(IssueDetailsCard, {
      props: {
        ...baseProps,
        initialData: { ...baseProps.initialData, issueId: '' },
      },
    });

    expect(wrapperWithoutIssueId.find<HTMLInputElement>('#issue-number').element.value).toBe('—');
    expect(wrapperWithoutIssueId.text()).toContain('Ticketnummer —');
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('falls back to em dash when modifiedAt is missing', () => {
    const wrapperWithoutModifiedAt = mount(IssueDetailsCard, {
      props: {
        ...baseProps,
        initialData: { ...baseProps.initialData, modifiedAt: undefined },
      },
    });

    expect(wrapperWithoutModifiedAt.find<HTMLInputElement>('#issue-assigned-at').element.value).toBe('—');
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('shows raw modifiedAt value when it is not a valid date', () => {
    const wrapperWithInvalidDate = mount(IssueDetailsCard, {
      props: {
        ...baseProps,
        initialData: { ...baseProps.initialData, modifiedAt: 'not-a-date' },
      },
    });

    expect(wrapperWithInvalidDate.find<HTMLInputElement>('#issue-assigned-at').element.value).toBe('not-a-date');
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('updates fields when initialData prop changes', async () => {
    await wrapper.setProps({
      initialData: {
        issueId: 'issue-2',
        title: 'Replaced title',
        status: 'CLOSED',
        assigneeId: 'user-2',
        reportedBy: 'John Reporter',
        project: 'Project B',
        issueType: 'DEFECT',
        tenancy: 'tenant-2',
        category: 'WATER_DAMAGE',
        priority: 'HIGH',
        modifiedAt: '2026-02-01T00:00:00Z',
      },
    });
    await nextTick();

    expect(wrapper.find<HTMLInputElement>('#issue-title').element.value).toBe('Replaced title');
    expect(wrapper.find<HTMLInputElement>('#issue-reporter').element.value).toBe('John Reporter');
    expect(wrapper.find<HTMLInputElement>('#issue-tenancy').element.value).toBe('tenant-2');
    // canSave should be false again since original values now match the new data
    expect(findSaveButton(wrapper).attributes('disabled')).toBeDefined();
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('includes assigneeId, category and priority in payload when changed', async () => {
    vi.spyOn(issueService, 'updateIssue').mockResolvedValue({});

    const categoryOption = { value: 'WATER_DAMAGE', label: 'Wasserschaden' };

    await wrapper.findComponent(MemberAutoComplete).vm.$emit('update:modelValue', 'user-2');
    await wrapper.findAllComponents(AutoComplete)[0].vm.$emit('update:modelValue', categoryOption);
    await wrapper.findAllComponents(Select)[2].vm.$emit('update:modelValue', 'HIGH');
    await nextTick();

    await findSaveButton(wrapper).trigger('click');
    await flushPromises();

    expect(issueService.updateIssue).toHaveBeenCalledWith(
      'issue-1',
      {
        assigneeId: 'user-2', category: 'WATER_DAMAGE', priority: 'HIGH' 
      },
    );
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('omits title from payload when only another field changes', async () => {
    vi.spyOn(issueService, 'updateIssue').mockResolvedValue({});

    await wrapper.findAllComponents(Select)[0].vm.$emit('update:modelValue', 'CLOSED');
    await nextTick();

    await findSaveButton(wrapper).trigger('click');
    await flushPromises();

    expect(issueService.updateIssue).toHaveBeenCalledWith(
      'issue-1',
      { status: 'CLOSED' },
    );
  });

  // ─── Accept/Reject Actions ───────────────────────────────────────────────────
  describe('accept/reject actions', () => {
    function mountPending() {
      return mount(IssueDetailsCard, {
        props: {
          ...baseProps,
          initialData: { ...baseProps.initialData, status: 'PENDING' },
        },
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    test('accept/reject buttons are absent when status is not PENDING', () => {
      expect(wrapper.findComponent(IssueAcceptButton).exists()).toBe(false);
      expect(wrapper.findComponent(IssueRejectButton).exists()).toBe(false);
    });

    // ─────────────────────────────────────────────────────────────────────────
    test('accept/reject buttons appear when status is PENDING', () => {
      const pendingWrapper = mountPending();

      expect(pendingWrapper.findComponent(IssueAcceptButton).exists()).toBe(true);
      expect(pendingWrapper.findComponent(IssueRejectButton).exists()).toBe(true);
    });

    // ─────────────────────────────────────────────────────────────────────────
    test('buttons remain visible after an unsaved status edit, based on the persisted status', async () => {
      const pendingWrapper = mountPending();

      await pendingWrapper.findAllComponents(Select)[0].vm.$emit('update:modelValue', 'CLOSED');
      await nextTick();

      expect(pendingWrapper.findComponent(IssueAcceptButton).exists()).toBe(true);
      expect(pendingWrapper.findComponent(IssueRejectButton).exists()).toBe(true);
    });

    // ─────────────────────────────────────────────────────────────────────────
    test('accepted event syncs fields, disables save, and emits saved', async () => {
      const pendingWrapper = mountPending();

      await pendingWrapper.findComponent(IssueAcceptButton).vm.$emit('accepted', {
        status: 'OPEN',
        assigneeId: 'user-1',
      } as IssueJson);
      await nextTick();

      expect(pendingWrapper.findComponent(IssueAcceptButton).exists()).toBe(false);
      expect(findSaveButton(pendingWrapper).attributes('disabled')).toBeDefined();
      expect(pendingWrapper.emitted('saved')).toBeTruthy();
    });

    // ─────────────────────────────────────────────────────────────────────────
    test('accepted event overwrites unsaved edits to other fields with the server response', async () => {
      const pendingWrapper = mountPending();

      await pendingWrapper.find('#issue-title').setValue('Unsaved local title');

      await pendingWrapper.findComponent(IssueAcceptButton).vm.$emit('accepted', {
        title: 'Old title',
        status: 'OPEN',
        assigneeId: 'user-1',
      } as IssueJson);
      await nextTick();

      expect(pendingWrapper.find<HTMLInputElement>('#issue-title').element.value).toBe('Old title');
      expect(findSaveButton(pendingWrapper).attributes('disabled')).toBeDefined();
    });

    // ─────────────────────────────────────────────────────────────────────────
    test('rejected event syncs fields, disables save, and emits saved', async () => {
      const pendingWrapper = mountPending();

      await pendingWrapper.findComponent(IssueRejectButton).vm.$emit('rejected', {
        status: 'REJECTED',
        assigneeId: 'user-1',
      } as IssueJson);
      await nextTick();

      expect(pendingWrapper.findComponent(IssueRejectButton).exists()).toBe(false);
      expect(findSaveButton(pendingWrapper).attributes('disabled')).toBeDefined();
      expect(pendingWrapper.emitted('saved')).toBeTruthy();
    });
  });
});
