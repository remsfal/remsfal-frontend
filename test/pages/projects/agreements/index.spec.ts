import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import RentalAgreementListPage from '@/pages/projects/[projectId]/agreements/index.vue';

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>();
  return {
    ...actual,
    useRoute: () => ({ params: { projectId: 'project-123' } }),
  };
});

vi.mock('@/features/project/rentalAgreements', () => ({
  RentalAgreementListView: {
    name: 'RentalAgreementListView',
    props: ['projectId'],
    template: '<div data-test="rental-agreement-list-view-stub" />',
  },
}));

describe('projects/[projectId]/agreements/index.vue', () => {
  it('renders RentalAgreementListView', () => {
    const wrapper = mount(RentalAgreementListPage);
    expect(wrapper.find('[data-test="rental-agreement-list-view-stub"]').exists()).toBe(true);
  });

  it('passes projectId from route params to RentalAgreementListView', () => {
    const wrapper = mount(RentalAgreementListPage);
    const view = wrapper.findComponent({ name: 'RentalAgreementListView' });
    expect(view.props('projectId')).toBe('project-123');
  });
});
