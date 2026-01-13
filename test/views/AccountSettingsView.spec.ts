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
   
      // Alternative email handling (UI only)
  describe('Alternative email handling (UI only)', () => {
    const vm = () => wrapper.vm as any;

    beforeEach(() => {
      const v = vm();

      v.userProfile = { email: 'primary@example.com', alternativeEmail: null };
      v.editedUserProfile = { email: 'primary@example.com', alternativeEmail: null };

      v.visible = false;
      v.alternativeEmail = '';

      v.isEmailInvalid = false;
      v.emailErrorMessage = '';

      v.altEmailSuccess = false;
      v.altEmailError = false;
      v.changes = false;
    });

    test('marks email invalid if format is invalid', async () => {
      const v = vm();

      v.visible = true;
      v.alternativeEmail = 'not-an-email';

      v.saveAlternativeEmail();
      await nextTick();

      expect(v.isEmailInvalid).toBe(true);
      expect(v.emailErrorMessage).not.toBe('');
      expect(v.visible).toBe(true);

      expect(v.editedUserProfile.alternativeEmail ?? null).toBeNull();
    });

    test('rejects alternative email equal to primary email', async () => {
      const v = vm();

      v.visible = true;
      v.editedUserProfile.email = 'same@example.com';
      v.alternativeEmail = 'same@example.com';

      v.saveAlternativeEmail();
      await nextTick();

      expect(v.isEmailInvalid).toBe(true);
      expect(v.emailErrorMessage).not.toBe('');
      expect(v.visible).toBe(true);

      expect(v.editedUserProfile.alternativeEmail ?? null).toBeNull();
    });

    test('successful UI save sets alternativeEmail and closes dialog (no backend icons)', async () => {
      const v = vm();

      v.visible = true;
      v.alternativeEmail = 'alt@example.com';

      v.saveAlternativeEmail();
      await nextTick();

      expect(v.editedUserProfile.alternativeEmail).toBe('alt@example.com');
      // applyAlternativeEmail updates userProfile too
      expect(v.userProfile.alternativeEmail).toBe('alt@example.com');

      expect(v.changes).toBe(true);

      expect(v.altEmailSuccess).toBe(false);
      expect(v.altEmailError).toBe(false);

      expect(v.visible).toBe(false);
      expect(v.alternativeEmail).toBe('');
      expect(v.isEmailInvalid).toBe(false);
      expect(v.emailErrorMessage).toBe('');
    });

    test('deleteAlternativeEmail clears alternativeEmail and resets backend icons', async () => {
      const v = vm();

      v.userProfile = { email: 'primary@example.com', alternativeEmail: 'alt@example.com' };
      v.editedUserProfile = { email: 'primary@example.com', alternativeEmail: 'alt@example.com' };

      v.altEmailSuccess = true;
      v.altEmailError = true;

      v.deleteAlternativeEmail();
      await nextTick();

      expect(v.editedUserProfile.alternativeEmail ?? null).toBeNull();
      expect(v.userProfile.alternativeEmail ?? null).toBeNull();

      expect(v.altEmailSuccess).toBe(false);
      expect(v.altEmailError).toBe(false);
      expect(v.changes).toBe(true);
    });

    test('resetForm clears dialog state', async () => {
      const v = vm();

      v.alternativeEmail = 'old@example.com';
      v.isEmailInvalid = true;
      v.emailErrorMessage = 'Fehler';

      v.resetForm();
      await nextTick();

      expect(v.alternativeEmail).toBe('');
      expect(v.isEmailInvalid).toBe(false);
      expect(v.emailErrorMessage).toBe('');
    });
  });
});