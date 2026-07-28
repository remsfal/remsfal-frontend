import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, VueWrapper, flushPromises } from '@vue/test-utils';
import ProgressSpinner from 'primevue/progressspinner';
import Message from 'primevue/message';
import NewTenancyIssueDialog from '@/features/tenant/tenantIssues/components/NewTenancyIssueDialog.vue';
import { tenancyService, type TenancyJson } from '@/services/TenancyService';
import { tenantIssueService, type TenantIssueJson } from '@/features/tenant/tenantIssues/services/TenantIssueService';
import { useUserSessionStore } from '@/stores/UserSession';
import i18n from '@/i18n/i18n';

const addMock = vi.fn();
vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: addMock }) }));

vi.mock('@/services/TenancyService', async () => {
  const actual = await vi.importActual<typeof import('@/services/TenancyService')>('@/services/TenancyService');
  return { ...actual, tenancyService: { getTenancies: vi.fn() } };
});

vi.mock('@/features/tenant/tenantIssues/services/TenantIssueService', async () => {
  const actual = await vi.importActual<typeof import('@/features/tenant/tenantIssues/services/TenantIssueService')>(
    '@/features/tenant/tenantIssues/services/TenantIssueService',
  );
  return { ...actual, tenantIssueService: { createIssueWithAttachment: vi.fn() } };
});

const DialogStub = {
  name: 'Dialog',
  props: ['visible', 'header'],
  emits: ['update:visible'],
  template: '<div data-testid="dialog" v-if="visible"><slot /></div>',
};

const Step1Stub = {
  name: 'Step1TypeCategoryForm',
  props: ['tenancyId', 'issueType', 'issueCategory', 'rentalUnitId', 'tenancies'],
  emits: ['update:tenancyId', 'update:issueType', 'update:issueCategory', 'update:rentalUnitId', 'next'],
  template: '<div data-testid="step1" />',
};

const Step2Stub = {
  name: 'Step2DetailsForm',
  props: ['issueType', 'causedBy', 'causedByUnknown', 'location', 'description'],
  emits: ['update:causedBy', 'update:causedByUnknown', 'update:location', 'update:description', 'next', 'back'],
  template: '<div data-testid="step2" />',
};

const Step3Stub = {
  name: 'Step3AttachmentsForm',
  props: ['files'],
  emits: ['update:files', 'next', 'back'],
  template: '<div data-testid="step3" />',
};

const Step4Stub = {
  name: 'Step4SummaryForm',
  props: [
    'tenancyId', 'issueType', 'issueCategory', 'rentalUnitId', 'causedBy',
    'causedByUnknown', 'location', 'description', 'files', 'tenancies', 'generatedTitle',
  ],
  emits: ['submit', 'back', 'editStep'],
  template: '<div data-testid="step4" />',
};

describe('NewTenancyIssueDialog', () => {
  const tenancyA: TenancyJson = {
    agreementId: 'agreement-a',
    projectTitle: 'Projekt A',
    rentalUnits: [{
      id: 'unit-1', title: 'Wohnung 1A', type: 'APARTMENT' 
    }],
  };
  const tenancyB: TenancyJson = {
    agreementId: 'agreement-b',
    projectTitle: 'Projekt B',
  };

  const createdIssue: TenantIssueJson = {
    id: 'issue-1',
    title: 'Wasserschaden bei Max Mustermann',
    status: 'OPEN',
    type: 'DEFECT',
    agreementId: 'agreement-a',
  };

  const mountDialog = (props: Partial<{ visible: boolean }> = {}) =>
    mount(NewTenancyIssueDialog, {
      props: { visible: true, ...props },
      global: {
        stubs: {
          Dialog: DialogStub,
          Step1TypeCategoryForm: Step1Stub,
          Step2DetailsForm: Step2Stub,
          Step3AttachmentsForm: Step3Stub,
          Step4SummaryForm: Step4Stub,
        },
      },
    });

  beforeEach(() => {
    addMock.mockClear();
    vi.mocked(tenancyService.getTenancies).mockResolvedValue([tenancyA, tenancyB]);
    vi.mocked(tenantIssueService.createIssueWithAttachment).mockResolvedValue(createdIssue);

    const sessionStore = useUserSessionStore();
    sessionStore.user = {
      id: 'user-1', firstName: 'Max', lastName: 'Mustermann' 
    } as ReturnType<typeof useUserSessionStore>['user'];
  });

  it('loads tenancies when the dialog becomes visible', async () => {
    mountDialog();
    await flushPromises();

    expect(tenancyService.getTenancies).toHaveBeenCalledTimes(1);
  });

  it('shows a loading spinner while tenancies are being fetched', async () => {
    let resolvePromise: ((value: TenancyJson[]) => void) | undefined;
    vi.mocked(tenancyService.getTenancies).mockReturnValue(new Promise((resolve) => { resolvePromise = resolve; }));

    const wrapper = mountDialog();
    await wrapper.vm.$nextTick();

    expect(wrapper.findComponent(ProgressSpinner).exists()).toBe(true);

    resolvePromise!([tenancyA]);
    await flushPromises();
  });

  it('auto-selects the tenancy when only one is available', async () => {
    vi.mocked(tenancyService.getTenancies).mockResolvedValue([tenancyA]);
    const wrapper = mountDialog();
    await flushPromises();

    const step1 = wrapper.findComponent(Step1Stub);
    expect(step1.props('tenancyId')).toBe('agreement-a');
  });

  it('does not auto-select a tenancy when multiple are available', async () => {
    const wrapper = mountDialog();
    await flushPromises();

    const step1 = wrapper.findComponent(Step1Stub);
    expect(step1.props('tenancyId')).toBeNull();
  });

  it('shows a warning message when there are no active contracts', async () => {
    vi.mocked(tenancyService.getTenancies).mockResolvedValue([]);
    const wrapper = mountDialog();
    await flushPromises();

    expect(wrapper.findComponent(Message).exists()).toBe(true);
    expect(wrapper.findComponent(Step1Stub).exists()).toBe(false);
  });

  it('shows an error toast when loading tenancies fails', async () => {
    vi.mocked(tenancyService.getTenancies).mockRejectedValue(new Error('network error'));
    mountDialog();
    await flushPromises();

    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({
      severity: 'error',
      summary: i18n.global.t('error.general'),
      detail: i18n.global.t('error.apiRequest'),
    }));
  });

  it('reloads tenancies the next time the dialog is reopened after a failed load', async () => {
    vi.mocked(tenancyService.getTenancies).mockRejectedValue(new Error('network error'));
    const wrapper = mountDialog({ visible: false });
    await wrapper.setProps({ visible: true });
    await flushPromises();
    expect(tenancyService.getTenancies).toHaveBeenCalledTimes(1);

    await wrapper.setProps({ visible: false });
    await wrapper.setProps({ visible: true });
    await flushPromises();

    expect(tenancyService.getTenancies).toHaveBeenCalledTimes(2);
  });

  const fillDefectForm = async (wrapper: VueWrapper) => {
    const step1 = wrapper.findComponent(Step1Stub);
    await step1.vm.$emit('update:tenancyId', 'agreement-a');
    await step1.vm.$emit('update:issueType', 'DEFECT');
    await step1.vm.$emit('update:issueCategory', 'WATER_DAMAGE');
    await step1.vm.$emit('update:rentalUnitId', 'unit-1');

    const step2 = wrapper.findComponent(Step2Stub);
    await step2.vm.$emit('update:causedBy', 'Nachbar 2. OG');
    await step2.vm.$emit('update:location', 'Küche');
    await step2.vm.$emit('update:description', 'Es tropft aus der Wand');
  };

  it('does not submit when required step1/step2 fields are missing', async () => {
    const wrapper = mountDialog();
    await flushPromises();

    await wrapper.findComponent(Step4Stub).vm.$emit('submit');
    await flushPromises();

    expect(tenantIssueService.createIssueWithAttachment).not.toHaveBeenCalled();
  });

  it('builds the generated title and description for a DEFECT issue and submits it', async () => {
    const wrapper = mountDialog();
    await flushPromises();
    await fillDefectForm(wrapper);

    await wrapper.findComponent(Step4Stub).vm.$emit('submit');
    await flushPromises();

    expect(tenantIssueService.createIssueWithAttachment).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Wasserschaden bei Max Mustermann',
        type: 'DEFECT',
        category: 'WATER_DAMAGE',
        agreementId: 'agreement-a',
        rentalUnitId: 'unit-1',
        rentalUnitType: 'APARTMENT',
        description: 'Es tropft aus der Wand\n\nVerursacher: Nachbar 2. OG\nOrt: Küche',
        location: 'Küche',
      }),
      [],
    );
  });

  it('marks the causer as unknown in the description when causedByUnknown is set', async () => {
    const wrapper = mountDialog();
    await flushPromises();
    await fillDefectForm(wrapper);

    const step2 = wrapper.findComponent(Step2Stub);
    await step2.vm.$emit('update:causedByUnknown', true);
    await step2.vm.$emit('update:causedBy', null);

    await wrapper.findComponent(Step4Stub).vm.$emit('submit');
    await flushPromises();

    expect(tenantIssueService.createIssueWithAttachment).toHaveBeenCalledWith(
      expect.objectContaining({description: 'Es tropft aus der Wand\n\nVerursacher: Unbekannt\nOrt: Küche',}),
      [],
    );
  });

  it('builds an INQUIRY title without caused-by/location metadata', async () => {
    const wrapper = mountDialog();
    await flushPromises();

    const step1 = wrapper.findComponent(Step1Stub);
    await step1.vm.$emit('update:tenancyId', 'agreement-a');
    await step1.vm.$emit('update:issueType', 'INQUIRY');
    await step1.vm.$emit('update:issueCategory', 'GENERAL');

    const step2 = wrapper.findComponent(Step2Stub);
    await step2.vm.$emit('update:description', 'Wann ist die nächste Ablesung?');

    await wrapper.findComponent(Step4Stub).vm.$emit('submit');
    await flushPromises();

    expect(tenantIssueService.createIssueWithAttachment).toHaveBeenCalledWith(
      expect.objectContaining({
        title: `${i18n.global.t('issueCategory.GENERAL')} von Max Mustermann`,
        type: 'INQUIRY',
        description: 'Wann ist die nächste Ablesung?',
      }),
      [],
    );
  });

  it('builds a TERMINATION title using the type label', async () => {
    const wrapper = mountDialog();
    await flushPromises();

    const step1 = wrapper.findComponent(Step1Stub);
    await step1.vm.$emit('update:tenancyId', 'agreement-a');
    await step1.vm.$emit('update:issueType', 'TERMINATION');

    await wrapper.findComponent(Step4Stub).vm.$emit('submit');
    await flushPromises();

    expect(tenantIssueService.createIssueWithAttachment).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Kündigung von Max Mustermann',
        type: 'TERMINATION',
      }),
      [],
    );
  });

  it('shows a success toast, emits issueCreated and closes the dialog on successful submit', async () => {
    const wrapper = mountDialog();
    await flushPromises();
    await fillDefectForm(wrapper);

    await wrapper.findComponent(Step4Stub).vm.$emit('submit');
    await flushPromises();

    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({
      severity: 'success',
      summary: i18n.global.t('success.created'),
    }));
    expect(wrapper.emitted('issueCreated')?.at(-1)).toEqual([createdIssue]);
    expect(wrapper.emitted('update:visible')?.at(-1)).toEqual([false]);
  });

  it('shows an error toast and keeps the dialog open when submission fails', async () => {
    vi.mocked(tenantIssueService.createIssueWithAttachment).mockRejectedValue(new Error('server error'));
    const wrapper = mountDialog();
    await flushPromises();
    await fillDefectForm(wrapper);

    await wrapper.findComponent(Step4Stub).vm.$emit('submit');
    await flushPromises();

    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({
      severity: 'error',
      summary: i18n.global.t('error.general'),
      detail: i18n.global.t('tenantIssue.error'),
    }));
    expect(wrapper.emitted('issueCreated')).toBeFalsy();
    expect(wrapper.emitted('update:visible')).toBeFalsy();
  });

  it('resets the form state after a successful submit', async () => {
    const wrapper = mountDialog();
    await flushPromises();
    await fillDefectForm(wrapper);

    await wrapper.findComponent(Step4Stub).vm.$emit('submit');
    await flushPromises();

    const step1 = wrapper.findComponent(Step1Stub);
    expect(step1.props('tenancyId')).toBeNull();
    expect(step1.props('issueType')).toBeNull();
    const step3 = wrapper.findComponent(Step3Stub);
    expect(step3.props('files')).toEqual([]);
  });

  it('propagates files collected in step 3 to the created issue attachments', async () => {
    const file = new File(['x'], 'foto.jpg', { type: 'image/jpeg' });
    const wrapper = mountDialog();
    await flushPromises();
    await fillDefectForm(wrapper);

    const step3 = wrapper.findComponent(Step3Stub);
    await step3.vm.$emit('update:files', [file]);

    await wrapper.findComponent(Step4Stub).vm.$emit('submit');
    await flushPromises();

    expect(tenantIssueService.createIssueWithAttachment).toHaveBeenCalledWith(
      expect.anything(),
      [file],
    );
  });
});
