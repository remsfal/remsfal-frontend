import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import StoragePage from '@/pages/projects/[projectId]/units/storage/[unitId].vue';
import StorageDataCard from '@/components/storage/StorageDataCard.vue';

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>();
  return {
    ...actual,
    useRouter: () => ({ push: vi.fn() }),
    useRoute: () => ({ params: { projectId: 'project1', unitId: 'unit1' } }),
  };
});

vi.mock('@/components/storage/StorageDataCard.vue', () => ({
  default: {
    name: 'StorageDataCard',
    props: ['projectId', 'unitId'],
    template: '<div data-test="storage-data-card-stub" />',
  },
}));

describe('StoragePage', () => {
  it('renders UnitBreadcrumb and StorageDataCard', () => {
    const wrapper = mount(StoragePage);
    expect(wrapper.findComponent({ name: 'UnitBreadcrumb' }).exists()).toBe(true);
    expect(wrapper.findComponent(StorageDataCard).exists()).toBe(true);
  });

  it('passes route params to StorageDataCard', () => {
    const wrapper = mount(StoragePage);
    const card = wrapper.findComponent(StorageDataCard);
    expect(card.props('projectId')).toBe('project1');
    expect(card.props('unitId')).toBe('unit1');
  });
});
