import { describe, expect, test } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import LandingPage from '../../src/views/LandingPageView.vue';

describe('LandingPageView', () => {
  let wrapper: VueWrapper;

  test('renders properly', () => {
    wrapper = mount(LandingPage, {
      props: { msg: 'Herzlich Willkommen' },
    });
    expect(wrapper.text()).toContain('Herzlich Willkommen');
  });
});
