import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import PropertyPage from '@/pages/projects/[projectId]/units/property/[unitId].vue';
import PropertyDataCard from '@/features/project/rentableUnits/components/PropertyDataCard.vue';

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>();
  return {
    ...actual,
    useRouter: () => ({ push: vi.fn() }),
    useRoute: () => ({ params: { projectId: 'project1', unitId: 'unit1' } }),
  };
});

// Stub PropertyDataCard to avoid mounting its form/service dependencies
vi.mock('@/features/project/rentableUnits/components/PropertyDataCard.vue', () => ({
  default: {
    name: 'PropertyDataCard',
    props: ['projectId', 'unitId'],
    template: '<div data-test="property-data-card-stub" />',
  },
}));

describe('PropertyPage', () => {
  it('renders UnitBreadcrumb and PropertyDataCard', () => {
    const wrapper = mount(PropertyPage);
    expect(wrapper.findComponent({ name: 'UnitBreadcrumb' }).exists()).toBe(true);
    expect(wrapper.findComponent(PropertyDataCard).exists()).toBe(true);
  });

  it('passes projectId and unitId from route params to PropertyDataCard', () => {
    const wrapper = mount(PropertyPage);
    const card = wrapper.findComponent(PropertyDataCard);
    expect(card.props('projectId')).toBe('project1');
    expect(card.props('unitId')).toBe('unit1');
  });
});
