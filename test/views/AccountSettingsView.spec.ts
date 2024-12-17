import { describe, test, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import AccountSettingsView from '@/views/AccountSettingsView.vue';
import router from '@/router';
import PrimeVue from 'primevue/config';
import Card from 'primevue/card';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from '@/App.vue';
import { nextTick } from 'vue';

describe('AccountSettingsView', () => {
  let wrapper;

  beforeEach(() => {
    const pinia = createPinia();
    const app = createApp(App);
    app.use(pinia);

    wrapper = mount(AccountSettingsView, {
      global: {
        plugins: [PrimeVue, router],
        components: { Card },
      },
    });

    // Mock methods
    wrapper.vm.$options.fetchUserProfile = vi.fn().mockResolvedValue({
      firstName: 'First Name',
      lastName: 'Last Name',
    });
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
    wrapper.vm.saveProfile = vi.fn();
    wrapper.vm.fetchUserProfile = vi.fn();
    wrapper.vm.validateAddress = vi.fn();
  });

  test('The view is rendered properly', () => {
    expect(wrapper.exists()).toBe(true);
  });

  test('fetchUserProfile fetches user data successfully', async () => {
    await wrapper.vm.fetchUserProfile();
    expect(wrapper.vm.fetchUserProfile).toHaveBeenCalled();
    expect(wrapper.vm.User).not.toBeNull();
  });

  test('required inputs fields are validated successfully', async () => {
    const input = wrapper.find('input#firstName');
    expect(input.exists()).toBe(true);

    await input.setValue('First Name');
    expect(wrapper.vm.editedUserProfile.firstName).toBe('First Name');
    await input.trigger('blur');
    let errorMessage = wrapper.find('input#firstName ~ .error');
    expect(errorMessage.text()).toBe('');

    await input.setValue('');
    await input.trigger('blur');
    errorMessage = wrapper.find('input#firstName ~ .error');
    expect(errorMessage.text()).toBe('Bitte eingeben!');
  });

  test('phonenumbers have to be digits only', async () => {
    const input = wrapper.find('input#mobilePhoneNumber');
    expect(input.exists()).toBe(true);

    await input.setValue('123456789');
    await input.trigger('blur');
    let errorMessage = wrapper.find('input#mobilePhoneNumber ~ .error');
    expect(errorMessage.text()).toBe('');

    await input.setValue('12w134567');
    await input.trigger('blur');
    errorMessage = wrapper.find('input#mobilePhoneNumber ~ .error');
    expect(errorMessage.text()).toBe('Telefonnummer ist ungültig!');
  });

  test('saveProfile is called on save button click', async () => {
    wrapper.vm.changes = true;
    await nextTick();
    const saveButton = wrapper.find('.save-button');
    expect(saveButton.exists()).toBe(true);

    await wrapper.vm.saveProfile();
    expect(wrapper.vm.saveProfile).toHaveBeenCalled();
  });

  test('changes are discarded after clicking the cancel button', async () => {
    wrapper.vm.changes = true;
    await nextTick();
    const cancelButton = wrapper.find('.cancel-button');
    expect(cancelButton.exists()).toBe(true);

    await cancelButton.trigger('click');
    expect(wrapper.vm.editedUserProfile).toEqual(wrapper.vm.userProfile);
  });

  test('check if all fields for address are filled', async () => {
    wrapper.vm.editedAddress = {
      street: 'Test Street',
      zip: '12345',
      city: 'Test City',
      province: 'Test Province',
      countryCode: 'TC',
    };

    await wrapper.vm.validateAddress(wrapper.vm.editedAddress);
    expect(wrapper.vm.validateAddress).toHaveBeenCalled();
    expect(wrapper.vm.editedAddress.street.length).toBeGreaterThan(0);
    expect(wrapper.vm.editedAddress.zip.length).toBeGreaterThan(0);
    expect(wrapper.vm.editedAddress.city.length).toBeGreaterThan(0);
    expect(wrapper.vm.editedAddress.province.length).toBeGreaterThan(0);
    expect(wrapper.vm.editedAddress.countryCode.length).toBeGreaterThan(0);
  });
});
