import { describe, it, expect } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import Select from 'primevue/select';
import SelectButton from 'primevue/selectbutton';
import AutoComplete from 'primevue/autocomplete';
import Button from 'primevue/button';
import Step1TypeCategoryForm from '@/features/tenant/tenantIssues/components/Step1TypeCategoryForm.vue';
import type { TenancyJson } from '@/services/TenancyService';
import i18n from '@/i18n/i18n';

describe('Step1TypeCategoryForm', () => {
  const tenancyWithUnit: TenancyJson = {
    agreementId: 'agreement-1',
    projectTitle: 'Projekt A',
    rentalUnits: [
      {
        id: 'unit-1', title: 'Wohnung 1A', type: 'APARTMENT' 
      },
    ],
  };

  const tenancyWithoutUnit: TenancyJson = {
    agreementId: 'agreement-2',
    projectTitle: 'Projekt B',
  };

  const defaultProps = {
    tenancyId: null,
    issueType: null,
    issueCategory: null,
    rentalUnitId: null,
    tenancies: [] as TenancyJson[],
  };

  const mountForm = (props: Partial<typeof defaultProps> = {}) =>
    mount(Step1TypeCategoryForm, { props: { ...defaultProps, ...props } });

  const findNextButton = (wrapper: VueWrapper) =>
    wrapper.findAllComponents(Button).find((btn) => btn.props('icon') === 'pi pi-arrow-right')!;

  it('renders the step title', () => {
    const wrapper = mountForm();
    expect(wrapper.find('h3').text()).toBe(i18n.global.t('tenantIssue.step1.title'));
  });

  it('disables the tenancy select when only one tenancy is available', () => {
    const wrapper = mountForm({ tenancies: [tenancyWithUnit] });
    expect(wrapper.findComponent(Select).props('disabled')).toBe(true);
  });

  it('enables the tenancy select when multiple tenancies are available', () => {
    const wrapper = mountForm({ tenancies: [tenancyWithUnit, tenancyWithoutUnit] });
    expect(wrapper.findComponent(Select).props('disabled')).toBe(false);
  });

  it('does not render the category field for TERMINATION', () => {
    const wrapper = mountForm({ issueType: 'TERMINATION' });
    expect(wrapper.findComponent(AutoComplete).exists()).toBe(false);
  });

  it('renders the category field for DEFECT', () => {
    const wrapper = mountForm({ issueType: 'DEFECT' });
    expect(wrapper.findComponent(AutoComplete).exists()).toBe(true);
  });

  it('does not render the rental unit select when the tenancy has no rental units', async () => {
    const wrapper = mountForm({ tenancies: [tenancyWithoutUnit], issueType: 'DEFECT' });
    const select = wrapper.findComponent(Select);
    await select.vm.$emit('update:modelValue', 'agreement-2');

    expect(wrapper.findAllComponents(Select)).toHaveLength(1);
  });

  it('renders the rental unit select with options derived from the selected tenancy', async () => {
    const wrapper = mountForm({ tenancies: [tenancyWithUnit], issueType: 'DEFECT' });
    const tenancySelect = wrapper.findComponent(Select);
    await tenancySelect.vm.$emit('update:modelValue', 'agreement-1');

    const selects = wrapper.findAllComponents(Select);
    expect(selects).toHaveLength(2);
    expect(selects[1].props('options')).toEqual([{ label: 'Wohnung 1A', value: 'unit-1' }]);
  });

  it('falls back to type or location for rental units without a title', async () => {
    const tenancy: TenancyJson = {
      agreementId: 'agreement-3',
      rentalUnits: [{ id: 'unit-2', location: 'Erdgeschoss' }],
    };
    const wrapper = mountForm({ tenancies: [tenancy], issueType: 'DEFECT' });
    await wrapper.findComponent(Select).vm.$emit('update:modelValue', 'agreement-3');

    const selects = wrapper.findAllComponents(Select);
    expect(selects[1].props('options')).toEqual([{ label: 'Erdgeschoss', value: 'unit-2' }]);
  });

  it('filters categories by label via search', async () => {
    const wrapper = mountForm({ issueType: 'DEFECT' });
    const autoComplete = wrapper.findComponent(AutoComplete);

    await autoComplete.vm.$emit('complete', { query: 'wasserschaden' });

    const suggestions = autoComplete.props('suggestions') as Array<{ label: string }>;
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions.every((s) => s.label.toLowerCase().includes('wasserschaden'))).toBe(true);
  });

  it('resets the filtered categories to all options for an empty query', async () => {
    const wrapper = mountForm({ issueType: 'INQUIRY' });
    const autoComplete = wrapper.findComponent(AutoComplete);

    await autoComplete.vm.$emit('complete', { query: '' });

    const suggestions = autoComplete.props('suggestions') as Array<{ label: string }>;
    expect(suggestions.length).toBe(3);
  });

  it('resets the selected category when the issue type changes', async () => {
    const wrapper = mountForm({ issueType: 'DEFECT' });
    const autoComplete = wrapper.findComponent(AutoComplete);
    await autoComplete.vm.$emit('update:modelValue', { value: 'WATER_DAMAGE', label: 'Wasserschaden' });

    expect(wrapper.emitted('update:issueCategory')?.at(-1)).toEqual(['WATER_DAMAGE']);

    await wrapper.findComponent(SelectButton).vm.$emit('update:modelValue', 'TERMINATION');

    expect(wrapper.emitted('update:issueCategory')?.at(-1)).toEqual([null]);
    expect(wrapper.findComponent(AutoComplete).exists()).toBe(false);
  });

  it('resets the rental unit when the tenancy changes', async () => {
    const wrapper = mountForm({ tenancies: [tenancyWithUnit, tenancyWithoutUnit] });
    const select = wrapper.findComponent(Select);

    await select.vm.$emit('update:modelValue', 'agreement-1');

    expect(wrapper.emitted('update:rentalUnitId')).toBeTruthy();
    expect(wrapper.emitted('update:rentalUnitId')?.at(-1)).toEqual([null]);
  });

  it('disables the next button until tenancy, type and category are selected', async () => {
    const wrapper = mountForm({ tenancies: [tenancyWithUnit], issueType: 'DEFECT' });
    const nextButton = findNextButton(wrapper);
    expect(nextButton.attributes('disabled')).toBeDefined();

    await wrapper.findComponent(Select).vm.$emit('update:modelValue', 'agreement-1');
    await wrapper.findComponent(AutoComplete).vm.$emit('update:modelValue', { value: 'WATER_DAMAGE', label: 'Wasserschaden' });

    expect(findNextButton(wrapper).attributes('disabled')).toBeUndefined();
  });

  it('does not require a category to proceed for TERMINATION', async () => {
    const wrapper = mountForm({ tenancies: [tenancyWithUnit], issueType: 'TERMINATION' });
    await wrapper.findComponent(Select).vm.$emit('update:modelValue', 'agreement-1');

    expect(findNextButton(wrapper).attributes('disabled')).toBeUndefined();
  });

  it('emits the collected form state and next when the next button is clicked', async () => {
    const wrapper = mountForm({ tenancies: [tenancyWithUnit], issueType: 'DEFECT' });
    await wrapper.findComponent(Select).vm.$emit('update:modelValue', 'agreement-1');
    await wrapper.findComponent(AutoComplete).vm.$emit('update:modelValue', { value: 'WATER_DAMAGE', label: 'Wasserschaden' });

    await findNextButton(wrapper).trigger('click');

    expect(wrapper.emitted('update:tenancyId')?.at(-1)).toEqual(['agreement-1']);
    expect(wrapper.emitted('update:issueType')?.at(-1)).toEqual(['DEFECT']);
    expect(wrapper.emitted('update:rentalUnitId')?.at(-1)).toEqual([null]);
    expect(wrapper.emitted('next')).toBeTruthy();
  });

  it('does not emit next when required fields are missing', async () => {
    const wrapper = mountForm();
    await findNextButton(wrapper).trigger('click');

    expect(wrapper.emitted('next')).toBeFalsy();
  });
});
