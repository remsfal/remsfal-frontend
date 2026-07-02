import { describe, test, expect, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import AccountSettingsView from '@/features/common/users/views/AccountSettingsView.vue';

describe('AccountSettingsView', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    wrapper = mount(AccountSettingsView, {
      global: {
        stubs: {
          UserContactDataCard: true,
          UserAddressCard: true,
          UserDangerZoneCard: true,
          RouterLink: { template: '<a><slot /></a>' },
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

  test('renders navigation buttons to management, tenancies and contractor views', () => {
    const text = wrapper.text();
    expect(text).toContain('Zur Verwalter Ansicht');
    expect(text).toContain('Zur Mieter Ansicht');
    expect(text).toContain('Zur Auftragnehmer Ansicht');
  });
});
