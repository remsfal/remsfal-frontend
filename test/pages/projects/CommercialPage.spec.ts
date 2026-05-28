import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import CommercialPage from '@/pages/projects/[projectId]/units/commercial/[unitId].vue';
import CommercialDataCard from '@/features/project/rentableUnits/components/CommercialDataCard.vue';

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>();
  return {
    ...actual,
    useRouter: () => ({ push: vi.fn() }),
    useRoute: () => ({ params: { projectId: 'project1', unitId: 'unit1' } }),
  };
});

vi.mock('@/features/project/rentableUnits/components/CommercialDataCard.vue', () => ({
  default: {
    name: 'CommercialDataCard',
    props: ['projectId', 'unitId'],
    template: '<div data-test="commercial-data-card-stub" />',
  },
}));

describe('CommercialPage', () => {
  it('renders UnitBreadcrumb and CommercialDataCard', () => {
    const wrapper = mount(CommercialPage);
    expect(wrapper.findComponent({ name: 'UnitBreadcrumb' }).exists()).toBe(true);
    expect(wrapper.findComponent(CommercialDataCard).exists()).toBe(true);
  });

  it('passes route params to CommercialDataCard', () => {
    const wrapper = mount(CommercialPage);
    const card = wrapper.findComponent(CommercialDataCard);
    expect(card.props('projectId')).toBe('project1');
    expect(card.props('unitId')).toBe('unit1');
  });
});
