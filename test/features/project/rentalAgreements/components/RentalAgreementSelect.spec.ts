import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, VueWrapper, flushPromises } from '@vue/test-utils';
import RentalAgreementSelect from '@/features/project/rentalAgreements/components/RentalAgreementSelect.vue';
import { rentalAgreementService } from '@/features/project/rentalAgreements/services/RentalAgreementService';
import type { RentalAgreementJson } from '@/features/project/rentalAgreements/services/RentalAgreementService';

vi.mock('@/features/project/rentalAgreements/services/RentalAgreementService', { spy: true });

describe('RentalAgreementSelect.vue', () => {
  let wrapper: VueWrapper;

  const mockAgreements: RentalAgreementJson[] = [
    {
      id: 'agreement-1',
      tenants: [{ firstName: 'Max', lastName: 'Mustermann' }],
      rentalUnits: [{ id: 'unit-1', title: 'Wohnung 1A' }],
    },
    {
      id: 'agreement-2',
      tenants: [{ firstName: 'Erika', lastName: 'Musterfrau' }],
      rentalUnits: [{ id: 'unit-2', location: 'Keller' }],
    },
  ];

  beforeEach(async () => {
    vi.spyOn(rentalAgreementService, 'fetchRentalAgreements').mockResolvedValue(mockAgreements);

    wrapper = mount(RentalAgreementSelect, {
      props: {
        projectId: 'project-123',
        modelValue: null,
      },
    });

    await flushPromises();
  });

  it('loads rental agreements on mount', () => {
    expect(rentalAgreementService.fetchRentalAgreements).toHaveBeenCalledWith('project-123');
  });

  it('renders an AutoComplete', () => {
    const autoComplete = wrapper.findComponent({ name: 'AutoComplete' });
    expect(autoComplete.exists()).toBe(true);
  });

  it('filters agreements by tenant name on complete', async () => {
    const autoComplete = wrapper.findComponent({ name: 'AutoComplete' });
    await autoComplete.vm.$emit('complete', { query: 'Erika' });
    await wrapper.vm.$nextTick();

    expect(autoComplete.props('suggestions')).toHaveLength(1);
    expect(autoComplete.props('suggestions')[0].id).toBe('agreement-2');
  });

  it('filters agreements by rental unit title/location on complete', async () => {
    const autoComplete = wrapper.findComponent({ name: 'AutoComplete' });
    await autoComplete.vm.$emit('complete', { query: 'Keller' });
    await wrapper.vm.$nextTick();

    expect(autoComplete.props('suggestions')).toHaveLength(1);
    expect(autoComplete.props('suggestions')[0].id).toBe('agreement-2');
  });

  it('resets to full list when the query is cleared', async () => {
    const autoComplete = wrapper.findComponent({ name: 'AutoComplete' });
    await autoComplete.vm.$emit('complete', { query: 'Erika' });
    await autoComplete.vm.$emit('complete', { query: '' });
    await wrapper.vm.$nextTick();

    expect(autoComplete.props('suggestions')).toHaveLength(2);
  });

  it('emits update:modelValue when a suggestion is selected', async () => {
    const autoComplete = wrapper.findComponent({ name: 'AutoComplete' });
    await autoComplete.vm.$emit('update:modelValue', mockAgreements[0]);

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toEqual(mockAgreements[0]);
  });

  it('emits blur when the AutoComplete is blurred', async () => {
    const autoComplete = wrapper.findComponent({ name: 'AutoComplete' });
    await autoComplete.vm.$emit('blur');

    expect(wrapper.emitted('blur')).toBeTruthy();
  });

  it('passes the invalid prop through as p-invalid class', async () => {
    await wrapper.setProps({ invalid: true });
    expect(wrapper.html()).toContain('p-invalid');
  });
});
