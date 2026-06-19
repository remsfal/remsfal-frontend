import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ProjectContractorListView from '@/views/project/ProjectContractorListView.vue';

vi.mock('@/features/project/contractors', () => ({
  ContractorListCard: { name: 'ContractorListCard', template: '<div data-test="contractor-list-card" />', props: ['projectId'] },
}));

describe('ProjectContractorListView', () => {
  it('renders without errors', () => {
    const wrapper = mount(ProjectContractorListView, { props: { projectId: 'proj-1' } });
    expect(wrapper.exists()).toBe(true);
  });

  it('renders ContractorListCard', () => {
    const wrapper = mount(ProjectContractorListView, { props: { projectId: 'proj-1' } });
    expect(wrapper.find('[data-test="contractor-list-card"]').exists()).toBe(true);
  });

  it('passes projectId prop to ContractorListCard', () => {
    const wrapper = mount(ProjectContractorListView, { props: { projectId: 'proj-42' } });
    const card = wrapper.findComponent({ name: 'ContractorListCard' });
    expect(card.props('projectId')).toBe('proj-42');
  });
});
