import { describe, test, expect, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import AccountDataView from '@/features/common/users/views/AccountDataView.vue';

describe('AccountDataView', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    wrapper = mount(AccountDataView, {
      global: {
        stubs: {
          UserContactDataCard: true,
          UserAddressCard: true,
          UserDangerZoneCard: true,
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

  test('renders no view switch buttons', () => {
    expect(wrapper.findAll('button')).toHaveLength(0);
    expect(wrapper.findAll('a')).toHaveLength(0);
  });
});
