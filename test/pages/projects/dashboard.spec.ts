import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ProjectDashboardPage from '@/pages/projects/[projectId]/dashboard.vue';

vi.mock('@/features/project/rentableUnits', () => ({
  RentableUnitsKpiCards: {
    name: 'RentableUnitsKpiCards',
    template: '<div data-test="rentable-units-kpi-stub" />',
  },
}));

vi.mock('@/features/project/rentalAgreements', () => ({
  RentalAgreementKpiCards: {
    name: 'RentalAgreementKpiCards',
    template: '<div />',
  },
}));

describe('projects/[projectId]/dashboard.vue', () => {
  it('renders without errors', () => {
    const wrapper = mount(ProjectDashboardPage);
    expect(wrapper.exists()).toBe(true);
  });

  it('renders RentableUnitsKpiCards', () => {
    const wrapper = mount(ProjectDashboardPage);
    expect(wrapper.find('[data-test="rentable-units-kpi-stub"]').exists()).toBe(true);
  });
});
