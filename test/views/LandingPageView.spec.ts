import {describe, expect, test} from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import LandingPage from '@/views/LandingPageView.vue';

describe('LandingPageView', () => {
  let wrapper: VueWrapper;

  test('renders properly', () => {
    wrapper = mount(LandingPage);
    expect(wrapper.text()).toContain('Die erste Open-Source-Software für ganzheitliches, digitales Facility Management');
  });
});
