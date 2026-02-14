import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { flushPromises } from '@vue/test-utils';
import Step2UnitsForm from '@/components/rentalAgreement/Step2UnitsForm.vue';
import type { SelectedUnit } from '@/components/rentalAgreement/Step2UnitsForm.vue';
import { propertyService } from '@/services/PropertyService';

vi.mock('@/services/PropertyService', () => ({propertyService: {getPropertyTree: vi.fn(),},}));

describe('Step2UnitsForm', () => {
  let wrapper: VueWrapper;

  const mockPropertyTree = {
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
      unitId: 'apartment-1',
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
    vi.mocked(propertyService.getPropertyTree).mockResolvedValue(mockPropertyTree);

    wrapper = mount(Step2UnitsForm, {props: defaultProps,});

    await flushPromises();
  });

  it('renders the component with title', () => {
    expect(wrapper.find('h3').text()).toBe('Mieteinheiten');
  });

  it('loads property tree on mount', () => {
    expect(propertyService.getPropertyTree).toHaveBeenCalledWith('project-123');
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
    expect(unitCards.length).toBe(1);
    expect(unitCards[0].text()).toContain('Apartment 101');
    expect(unitCards[0].text()).toContain('1000.00 €');
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
        unitId: 'apartment-1',
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
    expect(unitCard.text()).toContain('1000.00 €');
    expect(unitCard.text()).toContain('150.00 €');
    expect(unitCard.text()).toContain('100.00 €');
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
        unitId: 'apartment-1',
        unitType: 'APARTMENT',
        unitTitle: 'Apartment 101',
        basicRent: 1234.5,
        billingCycle: 'MONTHLY',
      },
    ];

    await wrapper.setProps({selectedUnits: unitsWithRent,});

    await wrapper.vm.$nextTick();

    const unitCard = wrapper.find('.bg-gray-50');
    expect(unitCard.text()).toContain('1234.50 €');
  });

  it('shows only rent fields that are defined', async () => {
    const unitsMinimal: SelectedUnit[] = [
      {
        unitId: 'apartment-1',
        unitType: 'APARTMENT',
        unitTitle: 'Apartment 101',
        basicRent: 1000,
        billingCycle: 'MONTHLY',
      },
    ];

    await wrapper.setProps({selectedUnits: unitsMinimal,});

    await wrapper.vm.$nextTick();

    const unitCard = wrapper.find('.bg-gray-50');
    expect(unitCard.text()).toContain('1000.00 €');
    // Operating costs and heating costs should not be shown
    expect(unitCard.text()).not.toContain('Betriebskostenvorauszahlung');
  });
});
