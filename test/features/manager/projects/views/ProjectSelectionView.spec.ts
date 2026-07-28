import { shallowMount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ProjectSelectionView from '@/features/manager/projects/views/ProjectSelectionView.vue';
import ProjectSelectionCard from '@/features/manager/projects/components/ProjectSelectionCard.vue';

describe('ProjectSelectionView.vue', () => {
  it('renders the view', () => {
    const wrapper = shallowMount(ProjectSelectionView);
    expect(wrapper.exists()).toBe(true);
  });

  it('renders the ProjectSelectionCard', () => {
    const wrapper = shallowMount(ProjectSelectionView);
    expect(wrapper.findComponent(ProjectSelectionCard).exists()).toBe(true);
  });
});
