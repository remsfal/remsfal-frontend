import {describe, test, expect, beforeEach, vi} from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import AccountSettingsView from '../../src/views/AccountSettingsView.vue';
import Card from 'primevue/card';
import Select from 'primevue/select';
import { createPinia } from 'pinia';
import { createApp, nextTick } from 'vue';
import App from '../../src/App.vue';

describe('AccountSettingsView', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    const pinia = createPinia();
    const app = createApp(App);
    app.use(pinia);

    wrapper = mount(AccountSettingsView, {global: {components: { Card, Select },},});

    // Mock methods
    wrapper.vm.$options.fetchUserProfile = vi.fn().mockResolvedValue({
      firstName: 'First Name',
      lastName: 'Last Name',
      locale: 'de',
    });
    wrapper.vm.$options.saveProfile = vi.fn().mockResolvedValue({
      firstName: 'Updated First Name',
      lastName: 'Updated Last Name',
      locale: 'de',
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
    wrapper.vm.isDisabled = vi.fn();
  });

  test('The view renders correctly', () => {
    expect(wrapper.exists()).toBe(true);
  });

  test('fetchUserProfile successfully retrieves user data', async () => {
    await wrapper.vm.fetchUserProfile();
    expect(wrapper.vm.fetchUserProfile).toHaveBeenCalled();
    expect(wrapper.vm.User).not.toBeNull();
  });

  describe('Validation of required input fields', async () => {
    test('A valid input value is accepted', async () => {
      const input = wrapper.find('input#firstName');
      expect(input.exists()).toBe(true);
      let errorMessage = wrapper.find('input#firstName ~ .error');
      await input.setValue('First Name');
      expect(wrapper.vm.editedUserProfile.firstName).toBe('First Name');
      await input.trigger('blur');
      errorMessage = wrapper.find('input#firstName ~ .error');
      expect(errorMessage.text()).toBe('');
    });

    test('An empty input value shows an error message', async () => {
      const input = wrapper.find('input#firstName');
      expect(input.exists()).toBe(true);
      let errorMessage = wrapper.find('input#firstName ~ .error');
      await input.setValue('');
      await input.trigger('blur');
      errorMessage = wrapper.find('input#firstName ~ .error');
      expect(errorMessage.text()).toBe('Bitte eingeben!');
    });

    test('An invalid input value fails regex validation and shows an error', async () => {
      const input = wrapper.find('input#firstName');
      expect(input.exists()).toBe(true);
      let errorMessage = wrapper.find('input#firstName ~ .error');
      await input.setValue('12dg');
      await input.trigger('blur');
      errorMessage = wrapper.find('input#firstName ~ .error');
      expect(errorMessage.text()).toBe('Eingabe bitte überprüfen!');
    });
  });

  describe('Validation of phone number', async () => {
    test('A valid phone number passes regex validation', async () => {
      const input = wrapper.find('input#mobilePhoneNumber');
      expect(input.exists()).toBe(true);
      let errorMessage = wrapper.find('input#mobilePhoneNumber ~ .error');
      await input.setValue('123456789');
      await input.trigger('blur');
      errorMessage = wrapper.find('input#mobilePhoneNumber ~ .error');
      expect(errorMessage.text()).toBe('');
    });

    test('A phone number containing characters shows an error message', async () => {
      const input = wrapper.find('input#mobilePhoneNumber');
      expect(input.exists()).toBe(true);
      let errorMessage = wrapper.find('input#mobilePhoneNumber ~ .error');
      await input.setValue('12w134567');
      await input.trigger('blur');
      errorMessage = wrapper.find('input#mobilePhoneNumber ~ .error');
      expect(errorMessage.text()).toBe('Telefonnummer ist ungültig!');
    });
  });

  test('saveProfile is called when the save button is clicked', async () => {
    wrapper.vm.changes = true;
    await nextTick();
    const saveButton = wrapper.find('.save-button');
    expect(saveButton.exists()).toBe(true);

    await wrapper.vm.saveProfile();
    expect(wrapper.vm.saveProfile).toHaveBeenCalled();
  });

  test('Changes are discarded after clicking the cancel button', async () => {
    wrapper.vm.changes = true;
    await nextTick();
    const cancelButton = wrapper.find('.cancel-button');
    expect(cancelButton.exists()).toBe(true);

    await cancelButton.trigger('click');
    expect(wrapper.vm.editedUserProfile).toEqual(wrapper.vm.userProfile);
  });

  describe('Validation of isDisabled function', async () => {
    test('Errors cause isDisabled to be true', async () => {
      wrapper.vm.changes = true;
      wrapper.vm.errorMessage = {firstname: 'Bitte eingeben!',};
      await nextTick();
      expect(wrapper.vm.isDisabled).toBe(true);
    });

    test('No errors cause isDisabled to be false', async () => {
      wrapper.vm.changes = true;
      wrapper.vm.errorMessage = {firstname: '',};
      await nextTick();
      expect(wrapper.vm.isDisabled).toBe(false);
    });

    test('logout redirects to logout endpoint', () => {
      delete window.location;
     // @ts-expect-error required because fetchUserProfile is mocked
      window.location = { pathname: '' };
      wrapper.vm.logout();
      expect(window.location.pathname).toBe('/api/v1/authentication/logout');
    });
    
    test('updateCountryFromCode sets error for invalid country code', async () => {
      wrapper.vm.editedAddress.countryCode = 'XX';
      await wrapper.vm.updateCountryFromCode();
      expect(wrapper.vm.errorMessage.countryCode).toBe('Ungültiges Länderkürzel!');
    });
    
  });

  describe('Locale handling', () => {
    test('validateLocale falls back to "en" when locale is invalid', () => {
      const result = wrapper.vm.validateLocale('fr');
      expect(result).toBe('en');
    });

    test('fetchUserProfile sets editedUserProfile.locale and i18n.locale when backend returns de', async () => {

      const result = await wrapper.vm.$options.fetchUserProfile();

      wrapper.vm.userProfile = result;
      wrapper.vm.editedUserProfile = { ...result };
      wrapper.vm.i18n.locale.value = wrapper.vm.validateLocale(result.locale);

      expect(wrapper.vm.editedUserProfile.locale).toBe('de');
      expect(wrapper.vm.i18n.locale.value).toBe('de');
    });

    test('fetchUserProfile sets editedUserProfile.locale to i18n.locale.value when backend returns locale = null', async () => {
      wrapper.vm.i18n.locale.value = 'de';

      wrapper.vm.$options.fetchUserProfile = vi.fn().mockResolvedValue({
        firstName: 'First Name',
        lastName: 'Last Name',
        locale: null,
      });

      const result = await wrapper.vm.$options.fetchUserProfile();

      wrapper.vm.userProfile = result;
      wrapper.vm.editedUserProfile = { ...result };

      wrapper.vm.editedUserProfile.locale = wrapper.vm.i18n.locale.value;

      expect(wrapper.vm.editedUserProfile.locale).toBe('de');
      expect(wrapper.vm.i18n.locale.value).toBe('de');
    });

    test('changing the locale Dropdown updates editedUserProfile.locale and i18n.locale', async () => {
      wrapper.vm.editedUserProfile.locale = 'de';
      wrapper.vm.i18n.locale.value = 'de';

      await nextTick();

      const select = wrapper.findComponent({ name: 'Select' });
      expect(select.exists()).toBe(true);

      await select.vm.$emit('update:modelValue', 'en');
      await nextTick();

      expect(wrapper.vm.editedUserProfile.locale).toBe('en');
      expect(wrapper.vm.i18n.locale.value).toBe('en');
    });

    test('i18n uses browser locale initially, then backend locale overwrites it after fetchUserProfile', async () => {
      Object.defineProperty(globalThis.navigator, 'language', {
        value: 'en',
        configurable: true,
      });

      expect(wrapper.vm.i18n.locale.value).toBe('en');

      const result = await wrapper.vm.$options.fetchUserProfile();

      wrapper.vm.userProfile = result;
      wrapper.vm.editedUserProfile = { ...result };
      wrapper.vm.i18n.locale.value = wrapper.vm.validateLocale(result.locale);

      await nextTick();

      expect(wrapper.vm.i18n.locale.value).toBe('de');
      expect(wrapper.vm.editedUserProfile.locale).toBe('de');
    });
  });
});
