import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import RentalAgreementDetailsPage from '@/pages/projects/[projectId]/agreements/[agreementId].vue';

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>();
  return {
    ...actual,
    useRoute: () => ({ params: { projectId: 'project-123', agreementId: 'agreement-456' } }),
  };
});

vi.mock('@/features/project/rentalAgreements', () => ({
  RentalAgreementDetailView: {
    name: 'RentalAgreementDetailView',
    props: ['projectId', 'agreementId'],
    template: '<div data-test="rental-agreement-detail-view-stub" />',
  },
}));

describe('projects/[projectId]/agreements/[agreementId].vue', () => {
  it('renders RentalAgreementDetailView', () => {
    const wrapper = mount(RentalAgreementDetailsPage);
    expect(wrapper.find('[data-test="rental-agreement-detail-view-stub"]').exists()).toBe(true);
  });

  it('passes projectId and agreementId from route params to RentalAgreementDetailView', () => {
    const wrapper = mount(RentalAgreementDetailsPage);
    const view = wrapper.findComponent({ name: 'RentalAgreementDetailView' });
    expect(view.props('projectId')).toBe('project-123');
    expect(view.props('agreementId')).toBe('agreement-456');
  });
});
