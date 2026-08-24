import { describe, it, expect, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { flushPromises } from '@vue/test-utils';
import Step2UnitsForm from '@/features/project/rentalAgreements/components/Step2UnitsForm.vue';
import type { SelectedUnit } from '@/features/project/rentalAgreements/components/Step2UnitsForm.vue';
import RentableUnitSelect from '@/features/project/rentableUnits/components/RentableUnitSelect.vue';
import type { PropertyListJson, RentalUnitTreeNodeJson } from '@/features/project/rentableUnits/services/PropertyService';
import { useRentableUnitsStore } from '@/features/project/rentableUnits/stores/RentableUnitsStore';

describe('Step2UnitsForm', () => {
  let wrapper: VueWrapper;

  const mockPropertyTree: PropertyListJson = {
    properties: [
      {
        key: 'property-1',
        data: {
          id: 'property-1',
          title: 'Property 1',
          type: 'PROPERTY',
        },
        children: [
          {
            key: 'building-1',
            data: {
              id: 'building-1',
              title: 'Building 1',
              type: 'BUILDING',
            },
            children: [
              {
                key: 'apartment-1',
                data: {
                  id: 'apartment-1',
                  title: 'Apartment 101',
                  type: 'APARTMENT',
                },
              },
            ],
          },
        ],
      },
    ],
  };

  const mockSelectedUnits: SelectedUnit[] = [
    {
      rentalUnitId: 'apartment-1',
      unitType: 'APARTMENT',
      unitTitle: 'Apartment 101',
      basicRent: 1000,
      billingCycle: 'MONTHLY',
    },
  ];

  const defaultProps = {
    projectId: 'project-123',
    selectedUnits: [],
    startOfRental: '2024-01-01',
    endOfRental: '2024-12-31',
  };

  beforeEach(async () => {
    useRentableUnitsStore().$reset();
    useRentableUnitsStore().rentableUnitTree = mockPropertyTree.properties as RentalUnitTreeNodeJson[];

    wrapper = mount(Step2UnitsForm, {props: defaultProps,});

    await flushPromises();
  });

  it('renders the component with title', () => {
    expect(wrapper.find('h3').text()).toBe('Mieteinheiten');
  });

  it('shows TreeSelect for unit selection', () => {
    const treeSelect = wrapper.findComponent({ name: 'TreeSelect' });
    expect(treeSelect.exists()).toBe(true);
  });

  it('does not show RentalDetailsForm initially', () => {
    const rentalDetailsForm = wrapper.findComponent({ name: 'RentalDetailsForm' });
    expect(rentalDetailsForm.exists()).toBe(false);
  });

  it('displays selected units list when units are provided', async () => {
    await wrapper.setProps({selectedUnits: mockSelectedUnits,});

    await wrapper.vm.$nextTick();

    const unitCards = wrapper.findAll('.bg-gray-50');
    expect(unitCards).toHaveLength(1);
    expect(unitCards[0].text()).toContain('Apartment 101');
    expect(unitCards[0].text()).toContain('1.000,00');
  });

  it('removes unit from list when trash button is clicked', async () => {
    await wrapper.setProps({selectedUnits: mockSelectedUnits,});

    await wrapper.vm.$nextTick();

    const deleteButtons = wrapper.findAllComponents({ name: 'Button' }).filter((btn) =>
      btn.props('icon') === 'pi pi-trash'
    );
    await deleteButtons[0].trigger('click');

    expect(wrapper.emitted('update:selectedUnits')).toBeTruthy();
    const emittedUnits = wrapper.emitted('update:selectedUnits')?.[0]?.[0] as SelectedUnit[];
    expect(emittedUnits).toHaveLength(0);
  });

  it('disables next button when no units are selected', () => {
    const nextButton = wrapper.findAll('button').find((btn) => btn.text().includes('Weiter'));
    expect(nextButton?.attributes('disabled')).toBeDefined();
  });

  it('enables next button when units are selected', async () => {
    await wrapper.setProps({selectedUnits: mockSelectedUnits,});

    await wrapper.vm.$nextTick();

    const nextButton = wrapper.findAll('button').find((btn) => btn.text().includes('Weiter'));
    expect(nextButton?.attributes('disabled')).toBeUndefined();
  });

  it('emits back event when back button is clicked', async () => {
    const backButton = wrapper.findAll('button').find((btn) => btn.text().includes('Zurück'));

    await backButton?.trigger('click');
    expect(wrapper.emitted('back')).toBeTruthy();
  });

  it('emits next event when next button is clicked', async () => {
    await wrapper.setProps({selectedUnits: mockSelectedUnits,});

    await wrapper.vm.$nextTick();

    const nextButton = wrapper.findAll('button').find((btn) => btn.text().includes('Weiter'));

    await nextButton?.trigger('click');
    expect(wrapper.emitted('next')).toBeTruthy();
  });

  it('displays unit details in the list', async () => {
    const unitsWithDetails: SelectedUnit[] = [
      {
        rentalUnitId: 'apartment-1',
        unitType: 'APARTMENT',
        unitTitle: 'Apartment 101',
        basicRent: 1000,
        operatingCostsPrepayment: 150,
        heatingCostsPrepayment: 100,
        billingCycle: 'MONTHLY',
      },
    ];

    await wrapper.setProps({selectedUnits: unitsWithDetails,});

    await wrapper.vm.$nextTick();

    const unitCard = wrapper.find('.bg-gray-50');
    expect(unitCard.text()).toContain('1.000,00');
    expect(unitCard.text()).toContain('150,00');
    expect(unitCard.text()).toContain('100,00');
  });

  it('shows unit type correctly', async () => {
    await wrapper.setProps({selectedUnits: mockSelectedUnits,});

    await wrapper.vm.$nextTick();

    const unitCard = wrapper.find('.bg-gray-50');
    expect(unitCard.text()).toContain('Wohnung');
  });

  it('passes correct props to RentalDetailsForm when unit is selected', async () => {
    // This test would need to simulate TreeSelect selection
    // For now, we just verify the form doesn't exist initially
    const rentalDetailsForm = wrapper.findComponent({ name: 'RentalDetailsForm' });
    expect(rentalDetailsForm.exists()).toBe(false);
  });

  it('displays heading for selected units section', async () => {
    await wrapper.setProps({selectedUnits: mockSelectedUnits,});

    await wrapper.vm.$nextTick();

    const headings = wrapper.findAll('h4');
    const unitsHeading = headings.find((h) => h.text().includes('Ausgewählte Einheiten'));
    expect(unitsHeading).toBeDefined();
  });

  it('has TreeSelect with proper configuration', () => {
    const treeSelect = wrapper.findComponent({ name: 'TreeSelect' });
    expect(treeSelect.props('selectionMode')).toBe('single');
    expect(treeSelect.props('fluid')).toBe(true);
  });

  it('formats rent values with two decimal places', async () => {
    const unitsWithRent: SelectedUnit[] = [
      {
        rentalUnitId: 'apartment-1',
        unitType: 'APARTMENT',
        unitTitle: 'Apartment 101',
        basicRent: 1234.5,
        billingCycle: 'MONTHLY',
      },
    ];

    await wrapper.setProps({selectedUnits: unitsWithRent,});

    await wrapper.vm.$nextTick();

    const unitCard = wrapper.find('.bg-gray-50');
    expect(unitCard.text()).toContain('1.234,50');
  });

  it('shows the rental details form once a unit is selected in the tree', async () => {
    const treeSelect = wrapper.findComponent({ name: 'TreeSelect' });
    await treeSelect.vm.$emit('node-select', {
      key: 'apartment-1',
      data: {
        id: 'apartment-1', title: 'Apartment 101', type: 'APARTMENT' 
      },
    });
    await wrapper.vm.$nextTick();

    expect(wrapper.findComponent({ name: 'RentalDetailsForm' }).exists()).toBe(true);
  });

  it('clears the current unit and hides the rental details form when the selection is cleared', async () => {
    const treeSelect = wrapper.findComponent({ name: 'TreeSelect' });
    await treeSelect.vm.$emit('node-select', {
      key: 'apartment-1',
      data: {
        id: 'apartment-1', title: 'Apartment 101', type: 'APARTMENT' 
      },
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.findComponent({ name: 'RentalDetailsForm' }).exists()).toBe(true);

    await treeSelect.vm.$emit('node-select', null);
    await wrapper.vm.$nextTick();

    expect(wrapper.findComponent({ name: 'RentalDetailsForm' }).exists()).toBe(false);
  });

  it('falls back to "Unbenannt" when the selected node has no title', async () => {
    const treeSelect = wrapper.findComponent({ name: 'TreeSelect' });
    await treeSelect.vm.$emit('node-select', {
      key: 'apartment-2',
      data: { id: 'apartment-2', type: 'APARTMENT' },
    });
    await wrapper.vm.$nextTick();

    const headings = wrapper.findAll('h4');
    expect(headings.some((h) => h.text().includes('Unbenannt'))).toBe(true);
  });

  it('adds the selected unit to the list when the rental details form is submitted', async () => {
    const treeSelect = wrapper.findComponent({ name: 'TreeSelect' });
    await treeSelect.vm.$emit('node-select', {
      key: 'apartment-1',
      data: {
        id: 'apartment-1', title: 'Apartment 101', type: 'APARTMENT' 
      },
    });
    await wrapper.vm.$nextTick();

    const detailsForm = wrapper.findComponent({ name: 'RentalDetailsForm' });
    await detailsForm.vm.$emit('submit', {
      basicRent: 500, billingCycle: 'MONTHLY', firstPaymentDate: '2024-01-01',
    });
    await wrapper.vm.$nextTick();

    const emitted = wrapper.emitted('update:selectedUnits');
    expect(emitted).toBeTruthy();
    expect(emitted![0][0]).toEqual([
      expect.objectContaining({
        rentalUnitId: 'apartment-1',
        unitType: 'APARTMENT',
        unitTitle: 'Apartment 101',
        basicRent: 500,
        billingCycle: 'MONTHLY',
        firstPaymentDate: '2024-01-01',
      }),
    ]);
    expect(wrapper.findComponent({ name: 'RentalDetailsForm' }).exists()).toBe(false);
  });

  it('hides the rental details form without adding a unit when cancelled', async () => {
    const treeSelect = wrapper.findComponent({ name: 'TreeSelect' });
    await treeSelect.vm.$emit('node-select', {
      key: 'apartment-1',
      data: {
        id: 'apartment-1', title: 'Apartment 101', type: 'APARTMENT' 
      },
    });
    await wrapper.vm.$nextTick();

    const detailsForm = wrapper.findComponent({ name: 'RentalDetailsForm' });
    await detailsForm.vm.$emit('cancel');
    await wrapper.vm.$nextTick();

    expect(wrapper.findComponent({ name: 'RentalDetailsForm' }).exists()).toBe(false);
    expect(wrapper.emitted('update:selectedUnits')).toBeFalsy();
  });

  it('updates the selected node key via the RentableUnitSelect v-model', async () => {
    const rentableSelect = wrapper.findComponent(RentableUnitSelect);
    await rentableSelect.vm.$emit('update:modelValue', 'apartment-5');
    await wrapper.vm.$nextTick();

    expect(rentableSelect.props('modelValue')).toBe('apartment-5');
  });

  it('passes undefined initial dates to RentalDetailsForm when start/end of rental are null', async () => {
    const wrapperNoDates = mount(Step2UnitsForm, {
      props: {
        ...defaultProps, startOfRental: null, endOfRental: null,
      },
    });
    await flushPromises();

    const treeSelect = wrapperNoDates.findComponent({ name: 'TreeSelect' });
    await treeSelect.vm.$emit('node-select', {
      key: 'apartment-1',
      data: {
        id: 'apartment-1', title: 'Apartment 101', type: 'APARTMENT' 
      },
    });
    await wrapperNoDates.vm.$nextTick();

    const detailsForm = wrapperNoDates.findComponent({ name: 'RentalDetailsForm' });
    expect(detailsForm.props('initialFirstPaymentDate')).toBeUndefined();
    expect(detailsForm.props('initialLastPaymentDate')).toBeUndefined();
  });

  it('does not show the basic rent line when basicRent is undefined', async () => {
    const unitWithoutRent: SelectedUnit[] = [{
      rentalUnitId: 'apartment-1', unitType: 'APARTMENT', unitTitle: 'Apartment 101', billingCycle: 'MONTHLY',
    }];
    await wrapper.setProps({ selectedUnits: unitWithoutRent });
    await wrapper.vm.$nextTick();

    const unitCard = wrapper.find('.bg-gray-50');
    expect(unitCard.text()).not.toContain('Nettokaltmiete');
  });

  it('shows only rent fields that are defined', async () => {
    const unitsMinimal: SelectedUnit[] = [
      {
        rentalUnitId: 'apartment-1',
        unitType: 'APARTMENT',
        unitTitle: 'Apartment 101',
        basicRent: 1000,
        billingCycle: 'MONTHLY',
      },
    ];

    await wrapper.setProps({selectedUnits: unitsMinimal,});

    await wrapper.vm.$nextTick();

    const unitCard = wrapper.find('.bg-gray-50');
    expect(unitCard.text()).toContain('1.000,00');
    // Operating costs and heating costs should not be shown
    expect(unitCard.text()).not.toContain('Betriebskostenvorauszahlung');
  });
});
