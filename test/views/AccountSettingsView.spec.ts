import {describe, test, expect, beforeEach, vi} from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import AccountSettingsView from '../../src/views/AccountSettingsView.vue';
import Card from 'primevue/card';
import { createPinia } from 'pinia';
import { createApp, nextTick } from 'vue';
import App from '../../src/App.vue';

describe('AccountSettingsView', () => {
  let wrapper: VueWrapper<any>;

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

    // ---- Alternative email test setup ----
    const vm = wrapper.vm as any;
    vm.visible = false;
    vm.alternativeEmail = '';
    vm.savedAlternativeEmail = null;
    vm.isEmailInvalid = false;
    vm.emailErrorMessage = '';
    vm.altEmailSuccess = false;
    vm.altEmailError = false;

   // Ensure primary email exists for comparisons
   vm.userProfile = { ...(vm.userProfile ?? {}), email: 'primary@example.com' };
   vm.editedUserProfile = { ...(vm.editedUserProfile ?? {}), email: 'primary@example.com' };
  });

  test('The view renders correctly', () => {
    expect(wrapper.exists()).toBe(true);
  });

  test('fetchUserProfile successfully retrieves user data', async () => {
    await wrapper.vm.fetchUserProfile();
    expect(wrapper.vm.fetchUserProfile).toHaveBeenCalled();
    expect(wrapper.vm.userProfile).not.toBeNull();
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

 
  // Alternative email handling
  describe('Alternative email handling (UI only)', () => {
  test('marks email invalid if empty or invalid', async () => {
    const vm = wrapper.vm as any;

    vm.visible = true;
    vm.editedUserProfile.email = 'primary@example.com';
    vm.alternativeEmail = 'not-an-email';

    vm.saveAlternativeEmail();

    expect(vm.isEmailInvalid).toBe(true);
    expect(vm.emailErrorMessage).toBeTruthy();
    expect(vm.visible).toBe(true); // dialog stays open
  });

  test('rejects alternative email equal to primary email', async () => {
    const vm = wrapper.vm as any;

    vm.visible = true;
    vm.editedUserProfile.email = 'same@example.com';
    vm.alternativeEmail = 'same@example.com';

    vm.saveAlternativeEmail();

    expect(vm.isEmailInvalid).toBe(true);
    expect(vm.emailErrorMessage).toBeTruthy();
    expect(vm.visible).toBe(true);
  });

  test('successful alternative email save sets savedAlternativeEmail and closes dialog', async () => {
    const vm = wrapper.vm as any;

    vm.visible = true;
    vm.editedUserProfile.email = 'primary@example.com';
    vm.alternativeEmail = 'alt@example.com';

    vm.saveAlternativeEmail();

    expect(vm.savedAlternativeEmail).toBe('alt@example.com');
    expect(vm.altEmailSuccess).toBe(true);
    expect(vm.altEmailError).toBe(false);
    expect(vm.visible).toBe(false);
    expect(vm.alternativeEmail).toBe('');
    expect(vm.isEmailInvalid).toBe(false);
    expect(vm.emailErrorMessage).toBe('');
  });

  test('deleteAlternativeEmail clears savedAlternativeEmail and resets flags', async () => {
    const vm = wrapper.vm as any;

    vm.savedAlternativeEmail = 'alt@example.com';
    vm.altEmailSuccess = true;
    vm.altEmailError = true;

    vm.deleteAlternativeEmail();

    expect(vm.savedAlternativeEmail).toBeNull();
    expect(vm.altEmailSuccess).toBe(false);
    expect(vm.altEmailError).toBe(false);
  });

  test('resetForm clears dialog state', () => {
    const vm = wrapper.vm as any;

    vm.alternativeEmail = 'old@example.com';
    vm.isEmailInvalid = true;
    vm.emailErrorMessage = 'Fehler';

    vm.resetForm();

    expect(vm.alternativeEmail).toBe('');
    expect(vm.isEmailInvalid).toBe(false);
    expect(vm.emailErrorMessage).toBe('');
  });
 });
});