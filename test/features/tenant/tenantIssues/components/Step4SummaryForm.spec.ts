import { describe, it, expect } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import Button from 'primevue/button';
import Step4SummaryForm from '@/features/tenant/tenantIssues/components/Step4SummaryForm.vue';
import type { TenancyJson } from '@/services/TenancyService';
import type { IssueType } from '@/services/IssueService';
import i18n from '@/i18n/i18n';

describe('Step4SummaryForm', () => {
  const tenancy: TenancyJson = {
    agreementId: 'agreement-1',
    projectTitle: 'Projekt A',
    rentalUnits: [
      {
        id: 'unit-1', title: 'Wohnung 1A', type: 'APARTMENT' 
      },
      { id: 'unit-2', location: 'Erdgeschoss' },
    ],
  };

  const defaultProps = {
    tenancyId: 'agreement-1',
    issueType: 'DEFECT' as IssueType | null,
    issueCategory: 'WATER_DAMAGE' as string | null,
    rentalUnitId: 'unit-1' as string | null,
    causedBy: 'Nachbar 2. OG' as string | null,
    causedByUnknown: false,
    location: 'Küche' as string | null,
    description: 'Es tropft aus der Wand' as string | null,
    files: [] as File[],
    tenancies: [tenancy],
    generatedTitle: 'Wasserschaden bei Max Mustermann',
  };

  const mountForm = (props: Partial<typeof defaultProps> = {}) =>
    mount(Step4SummaryForm, { props: { ...defaultProps, ...props } });

  const findEditButtons = (wrapper: VueWrapper) =>
    wrapper.findAllComponents(Button).filter((btn) => btn.props('icon') === 'pi pi-pencil');

  it('renders the generated title', () => {
    const wrapper = mountForm();
    expect(wrapper.text()).toContain('Wasserschaden bei Max Mustermann');
  });

  it('resolves the tenancy label from the matching tenancy', () => {
    const wrapper = mountForm();
    expect(wrapper.text()).toContain('Projekt A');
  });

  it('shows a dash when the tenancy cannot be found', () => {
    const wrapper = mountForm({ tenancyId: 'unknown-agreement' });
    const tenancySection = wrapper.findAll('div')
      .find((d) => d.text().includes(i18n.global.t('tenantIssue.step4.tenancySection')));
    expect(tenancySection?.text()).toContain('-');
  });

  it('shows the rental unit title when available', () => {
    const wrapper = mountForm({ rentalUnitId: 'unit-1' });
    expect(wrapper.text()).toContain('Wohnung 1A');
  });

  it('falls back to location when the rental unit has no title', () => {
    const wrapper = mountForm({ rentalUnitId: 'unit-2' });
    expect(wrapper.text()).toContain('Erdgeschoss');
  });

  it('does not render a rental unit section when none is selected', () => {
    const wrapper = mountForm({ rentalUnitId: null });
    expect(wrapper.text()).not.toContain(i18n.global.t('tenantIssue.step4.rentalUnitSection'));
  });

  it('shows the translated type label', () => {
    const wrapper = mountForm({ issueType: 'DEFECT' });
    expect(wrapper.text()).toContain(i18n.global.t('tenantIssue.types.DEFECT'));
  });

  it('shows a dash for the type when missing', () => {
    const wrapper = mountForm({ issueType: null });
    const typeRows = wrapper.findAll('div').filter((d) => d.text().startsWith(i18n.global.t('tenantIssue.step4.typeSection')));
    expect(typeRows.some((row) => row.text().endsWith('-'))).toBe(true);
  });

  it('shows the translated category label when present', () => {
    const wrapper = mountForm({ issueCategory: 'WATER_DAMAGE' });
    expect(wrapper.text()).toContain(i18n.global.t('issueCategory.WATER_DAMAGE'));
  });

  it('does not render a category section when there is no category', () => {
    const wrapper = mountForm({ issueCategory: null });
    expect(wrapper.text()).not.toContain(i18n.global.t('tenantIssue.step4.categorySection'));
  });

  it('shows causedBy and location only for DEFECT', () => {
    const defectWrapper = mountForm({ issueType: 'DEFECT' });
    expect(defectWrapper.text()).toContain('Nachbar 2. OG');
    expect(defectWrapper.text()).toContain('Küche');

    const inquiryWrapper = mountForm({ issueType: 'INQUIRY' });
    expect(inquiryWrapper.text()).not.toContain('Nachbar 2. OG');
  });

  it('shows the causedByUnknown label when causedByUnknown is true', () => {
    const wrapper = mountForm({
      issueType: 'DEFECT', causedByUnknown: true, causedBy: null 
    });
    expect(wrapper.text()).toContain(i18n.global.t('tenantIssue.step2.causedByUnknownLabel'));
  });

  it('shows the description when present', () => {
    const wrapper = mountForm({ description: 'Es tropft aus der Wand' });
    expect(wrapper.text()).toContain('Es tropft aus der Wand');
  });

  it('does not render a description section when there is none', () => {
    const wrapper = mountForm({ description: null });
    expect(wrapper.text()).not.toContain(i18n.global.t('tenantIssue.step4.description'));
  });

  it('shows a message when there are no attachments', () => {
    const wrapper = mountForm({ files: [] });
    expect(wrapper.text()).toContain(i18n.global.t('tenantIssue.step4.noAttachments'));
  });

  it('lists attached files with formatted size and type icon', () => {
    const imageFile = new File(['a'], 'foto.jpg', { type: 'image/jpeg' });
    Object.defineProperty(imageFile, 'size', { value: 1500 });
    const videoFile = new File(['b'], 'clip.mp4', { type: 'video/mp4' });
    const pdfFile = new File(['c'], 'bericht.pdf', { type: 'application/pdf' });
    const otherFile = new File(['d'], 'note.txt', { type: 'text/plain' });

    const wrapper = mountForm({ files: [imageFile, videoFile, pdfFile, otherFile] });

    expect(wrapper.text()).toContain('foto.jpg');
    expect(wrapper.text()).toContain('1.46 KB');
    expect(wrapper.find('i.pi-image').exists()).toBe(true);
    expect(wrapper.find('i.pi-video').exists()).toBe(true);
    expect(wrapper.find('i.pi-file-pdf').exists()).toBe(true);
    expect(wrapper.find('i.pi-file:not(.pi-file-pdf)').exists()).toBe(true);
  });

  it('emits editStep with the target step for each edit button', async () => {
    const wrapper = mountForm();
    const editButtons = findEditButtons(wrapper);
    expect(editButtons).toHaveLength(3);

    await editButtons[0].trigger('click');
    await editButtons[1].trigger('click');
    await editButtons[2].trigger('click');

    expect(wrapper.emitted('editStep')).toEqual([['1'], ['2'], ['3']]);
  });

  it('emits back when the back button is clicked', async () => {
    const wrapper = mountForm();
    const backButton = wrapper.findAllComponents(Button).find((btn) => btn.props('icon') === 'pi pi-arrow-left')!;
    await backButton.trigger('click');

    expect(wrapper.emitted('back')).toBeTruthy();
  });

  it('emits submit when the submit button is clicked', async () => {
    const wrapper = mountForm();
    const submitButton = wrapper.findAllComponents(Button).find((btn) => btn.props('icon') === 'pi pi-check')!;
    await submitButton.trigger('click');

    expect(wrapper.emitted('submit')).toBeTruthy();
  });
});
