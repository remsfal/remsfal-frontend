import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ProjectChatPage from '@/pages/projects/[projectId]/chat.vue';

vi.mock('@/views/ProjectChatView.vue', () => ({
  default: {
    name: 'ProjectChatView',
    template: '<div data-test="project-chat-view-stub" />',
  },
}));

describe('projects/[projectId]/chat.vue', () => {
  it('renders without errors', () => {
    const wrapper = mount(ProjectChatPage);
    expect(wrapper.exists()).toBe(true);
  });

  it('renders ProjectChatView', () => {
    const wrapper = mount(ProjectChatPage);
    expect(wrapper.find('[data-test="project-chat-view-stub"]').exists()).toBe(true);
  });
});
