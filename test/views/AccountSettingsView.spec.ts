import { describe, test, expect, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import AccountSettingsView from '@/views/AccountSettingsView.vue';

describe('AccountSettingsView', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    wrapper = mount(AccountSettingsView, {
      global: {
        stubs: {
          UserContactDataCard: true,
          UserAddressCard: true,
          UserDangerZoneCard: true,
          RouterLink: true,
        },
      },
    });
  });

  test('renders without errors', () => {
    expect(wrapper.exists()).toBe(true);
  });

  test('renders UserContactDataCard', () => {
    expect(wrapper.findComponent({ name: 'UserContactDataCard' }).exists()).toBe(true);
  });

  test('renders UserAddressCard', () => {
    expect(wrapper.findComponent({ name: 'UserAddressCard' }).exists()).toBe(true);
  });

  test('renders UserDangerZoneCard', () => {
    expect(wrapper.findComponent({ name: 'UserDangerZoneCard' }).exists()).toBe(true);
  });
});
