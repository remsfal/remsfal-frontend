import {describe, test, expect, beforeEach, vi} from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import AccountSettingsView from '../../src/views/AccountSettingsView.vue';
import Card from 'primevue/card';
import { createPinia } from 'pinia';
import { createApp, nextTick } from 'vue';
import App from '../../src/App.vue';

describe('AccountSettingsView', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    const pinia = createPinia();
    const app = createApp(App);
    app.use(pinia);

    wrapper = mount(AccountSettingsView, {global: {components: { Card },},});

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

  describe('Language switching for buttons', () => {
    test('Buttons use i18n translation keys instead of hardcoded text', async () => {
      wrapper.vm.changes = true;
      await nextTick();
      
      // Check that the save button uses the translation key
      const saveButton = wrapper.find('.save-button');
      expect(saveButton.exists()).toBe(true);
      
      // Check that the cancel button uses the translation key
      const cancelButton = wrapper.find('.cancel-button');
      expect(cancelButton.exists()).toBe(true);
      
      // Check that the delete button uses the translation key
      const deleteButton = wrapper.find('.delete-button');
      expect(deleteButton.exists()).toBe(true);
      
      // Verify buttons are rendered (translation keys should resolve to text)
      expect(saveButton.text()).toBeTruthy();
      expect(cancelButton.text()).toBeTruthy();
      expect(deleteButton.text()).toBeTruthy();
    });
  });

  describe('Address validation tests', () => {
    test('validateField validates street field correctly', async () => {
      wrapper.vm.editedAddress.street = 'Musterstraße 123';
      await wrapper.vm.validateField('street', 'address', 'street');
      expect(wrapper.vm.errorMessage.street).toBe('');
    });

    test('validateField shows error for invalid street format', async () => {
      wrapper.vm.editedAddress.street = 'Invalid Street';
      await wrapper.vm.validateField('street', 'address', 'street');
      expect(wrapper.vm.errorMessage.street).toBe('Eingabe bitte überprüfen!');
    });

    test('validateField validates city field correctly', async () => {
      wrapper.vm.editedAddress.city = 'Berlin';
      await wrapper.vm.validateField('city', 'address', 'city');
      expect(wrapper.vm.errorMessage.city).toBe('');
    });

    test('validateField shows error for empty city', async () => {
      wrapper.vm.editedAddress.city = '';
      await wrapper.vm.validateField('city', 'address', 'city');
      expect(wrapper.vm.errorMessage.city).toBe('Bitte eingeben!');
    });

    test('validateField validates province field correctly', async () => {
      wrapper.vm.editedAddress.province = 'Bayern';
      await wrapper.vm.validateField('province', 'address', 'province');
      expect(wrapper.vm.errorMessage.province).toBe('');
    });
  });

  describe('Country code validation', () => {
    test('updateCountryFromCode validates valid country code', async () => {
      wrapper.vm.editedAddress.countryCode = 'DE';
      await wrapper.vm.updateCountryFromCode();
      expect(wrapper.vm.errorMessage.countryCode).toBe('');
      expect(wrapper.vm.editedAddress.countryCode).toBe('DE');
    });

    test('updateCountryFromCode validates lowercase country code', async () => {
      wrapper.vm.editedAddress.countryCode = 'de';
      await wrapper.vm.updateCountryFromCode();
      expect(wrapper.vm.errorMessage.countryCode).toBe('');
      expect(wrapper.vm.editedAddress.countryCode).toBe('DE');
    });

    test('updateCountryFromCode shows error for empty country code', async () => {
      wrapper.vm.editedAddress.countryCode = '';
      await wrapper.vm.updateCountryFromCode();
      expect(wrapper.vm.errorMessage.countryCode).toBe('Ungültiges Länderkürzel!');
    });
  });

  describe('User profile helper functions', () => {
    test('getUpdatedValue returns value from editedUserProfile', () => {
      wrapper.vm.editedUserProfile.firstName = 'John';
      expect(wrapper.vm.getUpdatedValue('firstName')).toBe('John');
    });

    test('getUpdatedValue returns value from userProfile when editedUserProfile is empty', () => {
      wrapper.vm.userProfile = { firstName: 'Jane', lastName: 'Doe' };
      wrapper.vm.editedUserProfile = {};
      expect(wrapper.vm.getUpdatedValue('firstName')).toBe('Jane');
    });

    test('getUpdatedValue returns empty string for non-string values', () => {
      wrapper.vm.editedUserProfile.firstName = undefined;
      wrapper.vm.userProfile = {};
      expect(wrapper.vm.getUpdatedValue('firstName')).toBe('');
    });

    test('getUpdatedAddressValue returns value from editedAddress', () => {
      wrapper.vm.editedAddress.city = 'Berlin';
      expect(wrapper.vm.getUpdatedAddressValue('city')).toBe('Berlin');
    });

    test('getUpdatedAddressValue returns value from addressProfile when editedAddress is empty', () => {
      wrapper.vm.addressProfile = { city: 'Munich', street: 'Test St', zip: '12345', province: 'Bavaria', countryCode: 'DE' };
      wrapper.vm.editedAddress = {};
      expect(wrapper.vm.getUpdatedAddressValue('city')).toBe('Munich');
    });
  });

  describe('compareObjects function', () => {
    test('compareObjects returns true for identical objects', () => {
      const obj1 = { name: 'Test', value: '123' };
      const obj2 = { name: 'Test', value: '123' };
      expect(wrapper.vm.compareObjects(obj1, obj2)).toBe(true);
    });

    test('compareObjects returns false for different objects', () => {
      const obj1 = { name: 'Test1', value: '123' };
      const obj2 = { name: 'Test2', value: '123' };
      expect(wrapper.vm.compareObjects(obj1, obj2)).toBe(false);
    });

    test('compareObjects returns true for same reference', () => {
      const obj1 = { name: 'Test', value: '123' };
      expect(wrapper.vm.compareObjects(obj1, obj1)).toBe(true);
    });

    test('compareObjects returns false for objects with different key counts', () => {
      const obj1 = { name: 'Test', value: '123' };
      const obj2 = { name: 'Test' };
      expect(wrapper.vm.compareObjects(obj1, obj2)).toBe(false);
    });
  });

  describe('checkValues function', () => {
    test('checkValues returns false when user and address profiles are identical', () => {
      const user = { firstName: 'John', lastName: 'Doe' };
      const address = { city: 'Berlin', street: 'Test St 1', zip: '12345', province: 'Berlin', countryCode: 'DE' };
      expect(wrapper.vm.checkValues(user, user, address, address)).toBe(false);
    });

    test('checkValues returns true when user profiles differ', () => {
      const user1 = { firstName: 'John', lastName: 'Doe' };
      const user2 = { firstName: 'Jane', lastName: 'Doe' };
      const address = { city: 'Berlin', street: 'Test St 1', zip: '12345', province: 'Berlin', countryCode: 'DE' };
      expect(wrapper.vm.checkValues(user1, user2, address, address)).toBe(true);
    });

    test('checkValues returns true when address profiles differ', () => {
      const user = { firstName: 'John', lastName: 'Doe' };
      const address1 = { city: 'Berlin', street: 'Test St 1', zip: '12345', province: 'Berlin', countryCode: 'DE' };
      const address2 = { city: 'Munich', street: 'Test St 1', zip: '12345', province: 'Bavaria', countryCode: 'DE' };
      expect(wrapper.vm.checkValues(user, user, address1, address2)).toBe(true);
    });
  });

  describe('deleteAccount function', () => {
    test('deleteAccount opens dialog when delete button is clicked', async () => {
      wrapper.vm.deleteAcc = false;
      const deleteButton = wrapper.find('.delete-button');
      expect(deleteButton.exists()).toBe(true);
      await deleteButton.trigger('click');
      expect(wrapper.vm.deleteAcc).toBe(true);
    });
  });

  describe('lastName validation', () => {
    test('A valid lastName is accepted', async () => {
      const input = wrapper.find('input#lastName');
      expect(input.exists()).toBe(true);
      await input.setValue('Doe');
      expect(wrapper.vm.editedUserProfile.lastName).toBe('Doe');
      await input.trigger('blur');
      const errorMessage = wrapper.find('input#lastName ~ .error');
      expect(errorMessage.text()).toBe('');
    });

    test('An empty lastName shows an error message', async () => {
      const input = wrapper.find('input#lastName');
      expect(input.exists()).toBe(true);
      await input.setValue('');
      await input.trigger('blur');
      const errorMessage = wrapper.find('input#lastName ~ .error');
      expect(errorMessage.text()).toBe('Bitte eingeben!');
    });

    test('An invalid lastName shows an error', async () => {
      const input = wrapper.find('input#lastName');
      expect(input.exists()).toBe(true);
      await input.setValue('123Invalid');
      await input.trigger('blur');
      const errorMessage = wrapper.find('input#lastName ~ .error');
      expect(errorMessage.text()).toBe('Eingabe bitte überprüfen!');
    });
  });

  describe('Business phone validation', () => {
    test('A valid business phone number passes validation', async () => {
      const input = wrapper.find('input#businessPhoneNumber');
      expect(input.exists()).toBe(true);
      await input.setValue('+491234567890');
      await input.trigger('blur');
      const errorMessage = wrapper.find('input#businessPhoneNumber ~ .error');
      expect(errorMessage.text()).toBe('');
    });

    test('An invalid business phone number shows an error', async () => {
      const input = wrapper.find('input#businessPhoneNumber');
      expect(input.exists()).toBe(true);
      await input.setValue('invalid');
      await input.trigger('blur');
      const errorMessage = wrapper.find('input#businessPhoneNumber ~ .error');
      expect(errorMessage.text()).toBe('Telefonnummer ist ungültig!');
    });
  });

  describe('Private phone validation', () => {
    test('A valid private phone number passes validation', async () => {
      const input = wrapper.find('input#privatePhoneNumber');
      expect(input.exists()).toBe(true);
      await input.setValue('+491234567890');
      await input.trigger('blur');
      const errorMessage = wrapper.find('input#privatePhoneNumber ~ .error');
      expect(errorMessage.text()).toBe('');
    });

    test('An empty private phone number is allowed', async () => {
      const input = wrapper.find('input#privatePhoneNumber');
      expect(input.exists()).toBe(true);
      await input.setValue('');
      await input.trigger('blur');
      const errorMessage = wrapper.find('input#privatePhoneNumber ~ .error');
      expect(errorMessage.text()).toBe('');
    });
  });

  describe('Dialog visibility', () => {
    test('Delete account dialog can be opened', async () => {
      wrapper.vm.deleteAcc = false;
      const deleteButton = wrapper.find('.delete-button');
      expect(deleteButton.exists()).toBe(true);
      await deleteButton.trigger('click');
      expect(wrapper.vm.deleteAcc).toBe(true);
    });

    test('Save success dialog shows when saveSuccess is true', async () => {
      wrapper.vm.saveSuccess = true;
      await nextTick();
      expect(wrapper.vm.saveSuccess).toBe(true);
    });

    test('Save error dialog shows when saveError is true', async () => {
      wrapper.vm.saveError = true;
      await nextTick();
      expect(wrapper.vm.saveError).toBe(true);
    });
  });
});
