import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import RentableUnitsPage from '@/pages/projects/[projectId]/units/index.vue';

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>();
  return {
    ...actual,
    useRoute: () => ({ params: { projectId: 'project-123' } }),
  };
});

vi.mock('@/features/project/rentableUnits', () => ({
  RentableUnitsCard: {
    name: 'RentableUnitsCard',
    props: ['projectId'],
    template: '<div data-test="rentable-units-card-stub" />',
  },
}));

describe('projects/[projectId]/units/index.vue', () => {
  it('renders RentableUnitsCard', () => {
    const wrapper = mount(RentableUnitsPage);
    expect(wrapper.find('[data-test="rentable-units-card-stub"]').exists()).toBe(true);
  });

  it('passes projectId from route params to RentableUnitsCard', () => {
    const wrapper = mount(RentableUnitsPage);
    const card = wrapper.findComponent({ name: 'RentableUnitsCard' });
    expect(card.props('projectId')).toBe('project-123');
  });
});
