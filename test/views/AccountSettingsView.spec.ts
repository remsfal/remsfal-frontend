import {describe, test, expect, beforeEach, vi} from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import AccountSettingsView from '../../src/views/AccountSettingsView.vue';
import Card from 'primevue/card';
import { createPinia } from 'pinia';
import { createApp, nextTick } from 'vue';
import App from '../../src/App.vue';
import UserService from '../../src/services/UserService';

type UserProfileStub = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  alternativeEmail: string | null;
};

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
     describe('Alternative email handling', () => {
    test('marks email invalid if empty or invalid', async () => {
      wrapper.vm.alternativeEmail = 'not-an-email';
      wrapper.vm.editedUserProfile.email = 'primary@example.com';

      await wrapper.vm.saveAlternativeEmail();

      expect(wrapper.vm.isEmailInvalid).toBe(true);
      expect(wrapper.vm.emailErrorMessage).toBeTruthy();
    });

    test('rejects alternative email equal to primary email', async () => {
      wrapper.vm.editedUserProfile.email = 'same@example.com';
      wrapper.vm.alternativeEmail = 'same@example.com';

      await wrapper.vm.saveAlternativeEmail();

      expect(wrapper.vm.isEmailInvalid).toBe(true);
      expect(wrapper.vm.emailErrorMessage).toBe(
        'Die alternative E-Mail darf nicht der primären entsprechen.',
      );
    });

    test('successful alternative email save updates profile and flags', async () => {
      wrapper.vm.userProfile = {
        id: '1',
        firstName: 'First',
        lastName: 'Last',
        email: 'primary@example.com',
        alternativeEmail: null,
      } as UserProfileStub;

      wrapper.vm.editedUserProfile = {...wrapper.vm.userProfile,};

      wrapper.vm.alternativeEmail = 'alt@example.com';

      const updateUserSpy = vi
        .spyOn(UserService.prototype, 'updateUser')
        .mockResolvedValue({});

      await wrapper.vm.saveAlternativeEmail();

      expect(updateUserSpy).toHaveBeenCalledWith({ alternativeEmail: 'alt@example.com' });
      expect(wrapper.vm.userProfile.alternativeEmail).toBe('alt@example.com');
      expect(wrapper.vm.editedUserProfile.alternativeEmail).toBe('alt@example.com');
      expect(wrapper.vm.altEmailSuccess).toBe(true);
      expect(wrapper.vm.altEmailError).toBe(false);
      expect(wrapper.vm.visible).toBe(false);
    });

    test('sets error flag when backend call for alternative email fails', async () => {
      wrapper.vm.userProfile = {
        id: '1',
        firstName: 'First',
        lastName: 'Last',
        email: 'primary@example.com',
        alternativeEmail: null,
      } as UserProfileStub;

      wrapper.vm.editedUserProfile = {...wrapper.vm.userProfile,};

      wrapper.vm.alternativeEmail = 'alt@example.com';

      vi.spyOn(UserService.prototype, 'updateUser').mockRejectedValue(new Error('Boom'));

      await wrapper.vm.saveAlternativeEmail();

      expect(wrapper.vm.altEmailSuccess).toBe(false);
      expect(wrapper.vm.altEmailError).toBe(true);
    });

    test('deleteAlternativeEmail clears alternative email and resets flags', async () => {
      wrapper.vm.userProfile = {
        id: '1',
        firstName: 'First',
        lastName: 'Last',
        email: 'primary@example.com',
        alternativeEmail: 'alt@example.com',
      } as UserProfileStub;

      wrapper.vm.editedUserProfile = {...wrapper.vm.userProfile,};

      wrapper.vm.altEmailSuccess = true;
      wrapper.vm.altEmailError = false;
      wrapper.vm.alternativeEmail = 'alt@example.com';

      const updateUserSpy = vi
        .spyOn(UserService.prototype, 'updateUser')
        .mockResolvedValue({} as UserProfileStub);

      await wrapper.vm.deleteAlternativeEmail();

      expect(updateUserSpy).toHaveBeenCalledWith({ alternativeEmail: '' });
      expect(wrapper.vm.userProfile.alternativeEmail).toBeNull();
      expect(wrapper.vm.editedUserProfile.alternativeEmail).toBeNull();
      expect(wrapper.vm.alternativeEmail).toBe('');
      expect(wrapper.vm.altEmailSuccess).toBe(false);
      expect(wrapper.vm.altEmailError).toBe(false);
    });
    
    test('sets error flag when deleteAlternativeEmail backend call fails', async () => {
      wrapper.vm.userProfile = {
      id: '1',
      firstName: 'First',
      lastName: 'Last',
      email: 'primary@example.com',
      alternativeEmail: 'alt@example.com',
    } as UserProfileStub;

      wrapper.vm.editedUserProfile = {...wrapper.vm.userProfile,};

      wrapper.vm.altEmailSuccess = false;
      wrapper.vm.altEmailError = false;
      wrapper.vm.alternativeEmail = 'alt@example.com';

      vi.spyOn(UserService.prototype, 'updateUser').mockRejectedValue(new Error('Boom'));

      await wrapper.vm.deleteAlternativeEmail();

      expect(wrapper.vm.altEmailError).toBe(true);
    });

    test('resetForm clears dialog state', () => {
      wrapper.vm.alternativeEmail = 'old@example.com';
      wrapper.vm.isEmailInvalid = true;
      wrapper.vm.emailErrorMessage = 'Fehler';

      wrapper.vm.resetForm();

      expect(wrapper.vm.alternativeEmail).toBe('');
      expect(wrapper.vm.isEmailInvalid).toBe(false);
      expect(wrapper.vm.emailErrorMessage).toBe('');
    });
  });
});