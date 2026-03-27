import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import SitePage from '@/pages/projects/[projectId]/units/site/[unitId].vue';
import SiteDataCard from '@/features/project/rentableUnits/components/SiteDataCard.vue';
import RentableUnitTenantsCard from '@/features/project/rentableUnits/components/RentableUnitTenantsCard.vue';
import FacilityAddressCard from '@/components/FacilityAddressCard.vue';

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>();
  return {
    ...actual,
    useRouter: () => ({ push: vi.fn() }),
    useRoute: () => ({ params: { projectId: 'project1', unitId: 'unit1' } }),
  };
});

vi.mock('@/features/project/rentableUnits/components/SiteDataCard.vue', () => ({
  default: {
    name: 'SiteDataCard',
    props: ['projectId', 'unitId'],
    template: '<div data-test="site-data-card-stub" />',
  },
}));

vi.mock('@/features/project/rentableUnits/components/RentableUnitTenantsCard.vue', () => ({
  default: {
    name: 'RentableUnitTenantsCard',
    props: ['projectId', 'unitId'],
    template: '<div data-test="rentable-unit-tenants-card-stub" />',
  },
}));

vi.mock('@/components/FacilityAddressCard.vue', () => ({
  default: {
    name: 'FacilityAddressCard',
    props: ['projectId', 'unitId', 'facilityType'],
    template: '<div data-test="facility-address-card-stub" />',
  },
}));

describe('SitePage', () => {
  it('renders UnitBreadcrumb, SiteDataCard, RentableUnitTenantsCard and FacilityAddressCard', () => {
    const wrapper = mount(SitePage);
    expect(wrapper.findComponent({ name: 'UnitBreadcrumb' }).exists()).toBe(true);
    expect(wrapper.findComponent(SiteDataCard).exists()).toBe(true);
    expect(wrapper.findComponent(RentableUnitTenantsCard).exists()).toBe(true);
    expect(wrapper.findComponent(FacilityAddressCard).exists()).toBe(true);
  });

  it('passes route params to SiteDataCard', () => {
    const wrapper = mount(SitePage);
    const card = wrapper.findComponent(SiteDataCard);
    expect(card.props('projectId')).toBe('project1');
    expect(card.props('unitId')).toBe('unit1');
  });

  it('passes route params and facilityType to FacilityAddressCard', () => {
    const wrapper = mount(SitePage);
    const card = wrapper.findComponent(FacilityAddressCard);
    expect(card.props('projectId')).toBe('project1');
    expect(card.props('unitId')).toBe('unit1');
    expect(card.props('facilityType')).toBe('site');
  });
});
