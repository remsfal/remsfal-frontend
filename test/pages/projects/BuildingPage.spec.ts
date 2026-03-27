import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import BuildingPage from '@/pages/projects/[projectId]/units/building/[unitId].vue';
import BuildingDataCard from '@/features/project/rentableUnits/components/BuildingDataCard.vue';
import FacilityAddressCard from '@/components/FacilityAddressCard.vue';

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>();
  return {
    ...actual,
    useRouter: () => ({ push: vi.fn() }),
    useRoute: () => ({ params: { projectId: 'project1', unitId: 'unit1' } }),
  };
});

vi.mock('@/features/project/rentableUnits/components/BuildingDataCard.vue', () => ({
  default: {
    name: 'BuildingDataCard',
    props: ['projectId', 'unitId'],
    template: '<div data-test="building-data-card-stub" />',
  },
}));

vi.mock('@/components/FacilityAddressCard.vue', () => ({
  default: {
    name: 'FacilityAddressCard',
    props: ['projectId', 'unitId', 'facilityType'],
    template: '<div data-test="facility-address-card-stub" />',
  },
}));

describe('BuildingPage', () => {
  it('renders UnitBreadcrumb, BuildingDataCard and FacilityAddressCard', () => {
    const wrapper = mount(BuildingPage);
    expect(wrapper.findComponent({ name: 'UnitBreadcrumb' }).exists()).toBe(true);
    expect(wrapper.findComponent(BuildingDataCard).exists()).toBe(true);
    expect(wrapper.findComponent(FacilityAddressCard).exists()).toBe(true);
  });

  it('passes route params to BuildingDataCard', () => {
    const wrapper = mount(BuildingPage);
    const card = wrapper.findComponent(BuildingDataCard);
    expect(card.props('projectId')).toBe('project1');
    expect(card.props('unitId')).toBe('unit1');
  });

  it('passes route params and facilityType to FacilityAddressCard', () => {
    const wrapper = mount(BuildingPage);
    const card = wrapper.findComponent(FacilityAddressCard);
    expect(card.props('projectId')).toBe('project1');
    expect(card.props('unitId')).toBe('unit1');
    expect(card.props('facilityType')).toBe('building');
  });
});
