import { describe, test, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import AccountSettingsView from '@/views/AccountSettingsView.vue';
import router from '@/router';
import PrimeVue from 'primevue/config';
import Card from 'primevue/card';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from '@/App.vue';
import i18n from "../../src/i18n/i18n";

describe('AccountSettingsView', () => {
  let wrapper;

  beforeEach(() => {
    const pinia = createPinia();
    const app = createApp(App);
    app.use(pinia);

    wrapper = mount(AccountSettingsView, {
      global: {
        plugins: [PrimeVue, router, i18n],
        components: { Card },
      },
      shallow: true,
    });

    // Mock methods
    wrapper.vm.$options.fetchUserProfile = vi.fn();
    wrapper.vm.$options.saveProfile = vi.fn().mockResolvedValue({
      firstName: 'Updated First Name',
      lastName: 'Updated Last Name',
      address: {
        street: 'Updated Street',
        city: 'Updated City',
        zip: 'Updated Zip',
        province: 'Updated Province',
        countryCode: 'US',
      },
    });
    wrapper.vm.$options.getCity = vi.fn().mockResolvedValue([
      {
        city: 'Test City',
        province: 'Test Province',
        countryCode: 'TC',
      },
    ]);
  });

  test('The view is rendered properly', () => {
    expect(wrapper.exists()).toBe(true);
  });

  test('toggleEditMode method works correctly', async () => {
    wrapper.vm.toggleEditMode();
    expect(wrapper.vm.editMode).toBe(true);
    wrapper.vm.toggleEditMode();
    expect(wrapper.vm.editMode).toBe(false);
  });
});
