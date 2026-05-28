import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import ApartmentPage from '@/pages/projects/[projectId]/units/apartment/[unitId].vue';
import ApartmentDataCard from '@/features/project/rentableUnits/components/ApartmentDataCard.vue';

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>();
  return {
    ...actual,
    useRouter: () => ({ push: vi.fn() }),
    useRoute: () => ({ params: { projectId: 'project1', unitId: 'unit1' } }),
  };
});

vi.mock('@/features/project/rentableUnits/components/ApartmentDataCard.vue', () => ({
  default: {
    name: 'ApartmentDataCard',
    props: ['projectId', 'unitId'],
    template: '<div data-test="apartment-data-card-stub" />',
  },
}));

describe('ApartmentPage', () => {
  it('renders UnitBreadcrumb and ApartmentDataCard', () => {
    const wrapper = mount(ApartmentPage);
    expect(wrapper.findComponent({ name: 'UnitBreadcrumb' }).exists()).toBe(true);
    expect(wrapper.findComponent(ApartmentDataCard).exists()).toBe(true);
  });

  it('passes route params to ApartmentDataCard', () => {
    const wrapper = mount(ApartmentPage);
    const card = wrapper.findComponent(ApartmentDataCard);
    expect(card.props('projectId')).toBe('project1');
    expect(card.props('unitId')).toBe('unit1');
  });
});
