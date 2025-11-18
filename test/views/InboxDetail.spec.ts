import { describe, expect, it, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import InboxDetail from '../../src/views/InboxDetail.vue';
import { useRoute } from 'vue-router';

vi.mock('vue-router', () => ({
  useRoute: vi.fn(),
}));

describe('InboxDetail.vue', () => {
  let wrapper: VueWrapper;

  it('renders the message ID from route params', () => {
    const mockRoute = {
      params: {
        id: '123',
      },
    };

    vi.mocked(useRoute).mockReturnValue(mockRoute as any);

    wrapper = mount(InboxDetail);

    expect(wrapper.find('h1').text()).toBe('Nachricht 123');
  });

  it('displays correct heading with different ID', () => {
    const mockRoute = {
      params: {
        id: '456',
      },
    };

    vi.mocked(useRoute).mockReturnValue(mockRoute as any);

    wrapper = mount(InboxDetail);

    expect(wrapper.find('h1').text()).toBe('Nachricht 456');
  });

  it('renders main element', () => {
    const mockRoute = {
      params: {
        id: 'test-id',
      },
    };

    vi.mocked(useRoute).mockReturnValue(mockRoute as any);

    wrapper = mount(InboxDetail);

    expect(wrapper.find('main').exists()).toBe(true);
    expect(wrapper.find('main').classes()).toContain('px-6');
    expect(wrapper.find('main').classes()).toContain('py-8');
  });
});
