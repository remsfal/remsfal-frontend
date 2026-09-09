import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, VueWrapper, flushPromises } from '@vue/test-utils';
import RentalAgreementSelect from '@/features/project/rentalAgreements/components/RentalAgreementSelect.vue';
import { rentalAgreementService } from '@/features/project/rentalAgreements/services/RentalAgreementService';
import type { RentalAgreementItemJson } from '@/features/project/rentalAgreements/services/RentalAgreementService';

vi.mock('@/features/project/rentalAgreements/services/RentalAgreementService', { spy: true });

describe('RentalAgreementSelect.vue', () => {
  let wrapper: VueWrapper;

  const mockAgreements: RentalAgreementItemJson[] = [
    {
      id: 'agreement-1',
      startOfRental: '2024-01-01',
      tenants: [{
        id: 'tenant-1', firstName: 'Max', lastName: 'Mustermann' 
      }],
      rentalUnits: [{ id: 'unit-1', title: 'Wohnung 1A' }],
    },
    {
      id: 'agreement-2',
      startOfRental: '2024-01-01',
      tenants: [{
        id: 'tenant-2', firstName: 'Erika', lastName: 'Musterfrau' 
      }],
      rentalUnits: [{ id: 'unit-2', location: 'Keller' }],
    },
  ];

  beforeEach(async () => {
    vi.spyOn(rentalAgreementService, 'getRentalAgreements').mockResolvedValue(mockAgreements);

    wrapper = mount(RentalAgreementSelect, {
      props: {
        projectId: 'project-123',
        modelValue: null,
      },
    });

    await flushPromises();
  });

  it('loads rental agreements on mount', () => {
    expect(rentalAgreementService.getRentalAgreements).toHaveBeenCalledWith('project-123');
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

  it('opens the overlay when the dropdown button is clicked without a prior search', async () => {
    // Regression test: the very first click reuses the exact array reference
    // set on mount, which previously left AutoComplete's overlay closed
    // because it only opens when its `suggestions` prop reference changes.
    const autoComplete = wrapper.findComponent({ name: 'AutoComplete' });
    const dropdownButton = wrapper.find('.p-autocomplete-dropdown');

    await dropdownButton.trigger('click');
    await wrapper.vm.$nextTick();

    expect(autoComplete.vm.overlayVisible).toBe(true);
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

  it('does not forward the raw typeahead text as update:modelValue', async () => {
    // Regression test: AutoComplete (non-multiple) also emits update:modelValue
    // with the raw string the user is typing while searching, not only on a
    // genuine selection. Forwarding it used to round-trip through toOption()
    // and overwrite the input with the "unknown tenant" fallback label as
    // soon as a letter was typed.
    const autoComplete = wrapper.findComponent({ name: 'AutoComplete' });
    await autoComplete.vm.$emit('update:modelValue', 'M');

    expect(wrapper.emitted('update:modelValue')).toBeFalsy();
  });

  it('still forwards update:modelValue with null (explicit clear)', async () => {
    const autoComplete = wrapper.findComponent({ name: 'AutoComplete' });
    await autoComplete.vm.$emit('update:modelValue', null);

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toBeNull();
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

  it('gives the bound modelValue a display label instead of rendering the raw object', () => {
    const autoComplete = wrapper.findComponent({ name: 'AutoComplete' });
    // modelValue starts out null in the outer beforeEach; simulate a caller
    // binding the raw agreement object (no synthetic `label`) as v-model.
    return wrapper.setProps({ modelValue: mockAgreements[0] }).then(() => {
      expect(autoComplete.props('modelValue')).toMatchObject({
        id: 'agreement-1',
        label: 'Max Mustermann (Wohnung 1A)',
      });
    });
  });

  describe('initialAgreementId resolution', () => {
    it('resolves the id against the already-loaded list without fetching again', async () => {
      vi.mocked(rentalAgreementService.getRentalAgreements).mockClear();
      wrapper = mount(RentalAgreementSelect, {
        props: {
          projectId: 'project-123',
          modelValue: null,
          initialAgreementId: 'agreement-2',
        },
      });
      await flushPromises();

      expect(rentalAgreementService.getRentalAgreements).toHaveBeenCalledTimes(1);
      expect(wrapper.emitted('resolved')?.[0]?.[0]).toMatchObject({
        id: 'agreement-2',
        label: 'Erika Musterfrau (Keller)',
      });
    });

    it('emits resolved with null when there is no initialAgreementId', async () => {
      wrapper = mount(RentalAgreementSelect, {props: { projectId: 'project-123', modelValue: null },});
      await flushPromises();

      expect(wrapper.emitted('resolved')?.[0]?.[0]).toBeNull();
    });

    it('re-resolves from the cached list when initialAgreementId changes', async () => {
      vi.mocked(rentalAgreementService.getRentalAgreements).mockClear();
      wrapper = mount(RentalAgreementSelect, {
        props: {
          projectId: 'project-123',
          modelValue: null,
          initialAgreementId: 'agreement-1',
        },
      });
      await flushPromises();

      await wrapper.setProps({ initialAgreementId: 'agreement-2' });
      await flushPromises();

      expect(rentalAgreementService.getRentalAgreements).toHaveBeenCalledTimes(1);
      expect(wrapper.emitted('resolved')?.[1]?.[0]).toMatchObject({ id: 'agreement-2' });
    });
  });
});
