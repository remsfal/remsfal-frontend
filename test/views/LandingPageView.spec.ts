import { describe, test, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import LandingPage from '@/views/LandingPageView.vue';

describe('LandingPageView', () => {
  test('renders properly', () => {
    const wrapper = mount(LandingPage, { props: { msg: 'Herzlich Willkommen' } });
    expect(wrapper.text()).toContain('Herzlich Willkommen');
  });
});
