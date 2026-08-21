import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import SitePage from '@/pages/projects/[projectId]/units/site/[unitId].vue';
import SiteDataCard from '@/features/project/rentableUnits/components/SiteDataCard.vue';
import RentalAgreementListCard from '@/features/project/rentalAgreements/components/RentalAgreementListCard.vue';
import FacilityAddressCard from '@/features/project/rentableUnits/components/FacilityAddressCard.vue';

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

vi.mock('@/features/project/rentalAgreements/components/RentalAgreementListCard.vue', () => ({
  default: {
    name: 'RentalAgreementListCard',
    props: ['projectId', 'rentalUnitId', 'rentalUnitType'],
    template: '<div data-test="rental-agreement-list-card-stub" />',
  },
}));

vi.mock('@/features/project/rentableUnits/components/FacilityAddressCard.vue', () => ({
  default: {
    name: 'FacilityAddressCard',
    props: ['projectId', 'unitId', 'facilityType'],
    template: '<div data-test="facility-address-card-stub" />',
  },
}));

describe('SitePage', () => {
  it('renders UnitBreadcrumb, SiteDataCard, RentalAgreementListCard and FacilityAddressCard', () => {
    const wrapper = mount(SitePage);
    expect(wrapper.findComponent({ name: 'UnitBreadcrumb' }).exists()).toBe(true);
    expect(wrapper.findComponent(SiteDataCard).exists()).toBe(true);
    expect(wrapper.findComponent(RentalAgreementListCard).exists()).toBe(true);
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
    expect(card.props('facilityType')).toBe('SITE');
  });

  it('passes route params and unit filter to RentalAgreementListCard', () => {
    const wrapper = mount(SitePage);
    const card = wrapper.findComponent(RentalAgreementListCard);
    expect(card.props('projectId')).toBe('project1');
    expect(card.props('rentalUnitId')).toBe('unit1');
    expect(card.props('rentalUnitType')).toBe('SITE');
  });
});
