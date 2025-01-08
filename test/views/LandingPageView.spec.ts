import { describe, expect, test } from 'vitest';
import { mount } from '@vue/test-utils';
import LandingPage from '@/views/LandingPageView.vue';
import i18n from '../../src/i18n/i18n';

describe('LandingPageView', () => {
  test('renders properly', () => {
    const wrapper = mount(LandingPage, {
      props: { msg: 'Herzlich Willkommen' },
      global: {
        plugins: [i18n],
      },
    });
    expect(wrapper.text()).toContain('Herzlich Willkommen');
  });
});
