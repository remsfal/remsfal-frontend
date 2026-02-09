import {describe, test, expect, beforeEach, vi} from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import AccountSettingsView from '@/views/AccountSettingsView.vue';
import Card from 'primevue/card';
import { createPinia } from 'pinia';
import { createApp, nextTick } from 'vue';
import App from '@/App.vue';




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
    wrapper.vm.saveProfile = vi.fn();
    wrapper.vm.fetchUserProfile = vi.fn();
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
  });
   
    // Alternative email handling (UI only)
  describe('Alternative email handling (UI only)', () => {
    type AccountSettingsVm = {
      userProfile: { email?: string; additionalEmails?: string[] } | null;
      editedUserProfile: { email?: string; additionalEmails?: string[] } | null;


      visible: boolean;
      alternativeEmail: string;


      isEmailInvalid: boolean;
      emailErrorMessage: string;


      altEmailSuccess: boolean;
      altEmailError: boolean;
      changes: boolean;


      saveAlternativeEmail: () => void;
      deleteAlternativeEmail: () => void;
      resetForm: () => void;
    };


    const vm = (): AccountSettingsVm => wrapper.vm as unknown as AccountSettingsVm;


    beforeEach(() => {
      const v = vm();


      v.userProfile = { email: 'primary@example.com', additionalEmails: [] };
      v.editedUserProfile = { email: 'primary@example.com', additionalEmails: [] };


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


      expect(v.editedUserProfile?.additionalEmails ?? []).toEqual([]);
    });


    test('rejects alternative email equal to primary email', async () => {
      const v = vm();


      v.visible = true;
      v.editedUserProfile = { email: 'same@example.com', additionalEmails: [] };
      v.alternativeEmail = 'same@example.com';


      v.saveAlternativeEmail();
      await nextTick();


      expect(v.isEmailInvalid).toBe(true);
      expect(v.emailErrorMessage).not.toBe('');
      expect(v.visible).toBe(true);


      expect(v.editedUserProfile?.additionalEmails ?? []).toEqual([]);
    });


    test('successful UI save sets additionalEmails and closes dialog (no backend icons)', async () => {
      const v = vm();


      v.visible = true;
      v.alternativeEmail = 'alt@example.com';


      v.saveAlternativeEmail();
      await nextTick();


      expect(v.editedUserProfile?.additionalEmails).toEqual(['alt@example.com']);

      // userProfile should NOT be updated (only editedUserProfile is changed)
      expect(v.userProfile?.additionalEmails ?? []).toEqual([]);


      expect(v.changes).toBe(true);


      expect(v.altEmailSuccess).toBe(false);
      expect(v.altEmailError).toBe(false);


      expect(v.visible).toBe(false);
      expect(v.alternativeEmail).toBe('');
      expect(v.isEmailInvalid).toBe(false);
      expect(v.emailErrorMessage).toBe('');
    });


    test('deleteAlternativeEmail clears additionalEmails and resets backend icons', async () => {
      const v = vm();


      v.userProfile = { email: 'primary@example.com', additionalEmails: ['alt@example.com'] };
      v.editedUserProfile = { email: 'primary@example.com', additionalEmails: ['alt@example.com'] };


      v.altEmailSuccess = true;
      v.altEmailError = true;


      v.deleteAlternativeEmail();
      await nextTick();


      expect(v.editedUserProfile?.additionalEmails ?? []).toEqual([]);
      // userProfile should NOT be updated (only editedUserProfile is changed)
      expect(v.userProfile?.additionalEmails ?? []).toEqual(['alt@example.com']);


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

    test('trims alternative email before validation (spaces are removed)', async () => {
  const v = vm();

  v.visible = true;
  v.alternativeEmail = '   alt@example.com   ';

  v.saveAlternativeEmail();
  await nextTick();

  expect(v.editedUserProfile?.additionalEmails).toEqual(['alt@example.com']);
  // userProfile should NOT be updated (only editedUserProfile is changed)
  expect(v.userProfile?.additionalEmails ?? []).toEqual([]);
  expect(v.visible).toBe(false);
});

test('saveAlternativeEmail with empty string keeps dialog open and sets invalid flag', async () => {
  const v = vm();

  v.visible = true;
  v.alternativeEmail = '   '; // after trim -> empty

  v.saveAlternativeEmail();
  await nextTick();

  expect(v.isEmailInvalid).toBe(true);
  expect(v.emailErrorMessage).not.toBe('');
  expect(v.visible).toBe(true);
  expect(v.editedUserProfile?.additionalEmails ?? []).toEqual([]);
});

test('deleteAlternativeEmail when already empty still marks changes and clears icons', async () => {
  const v = vm();

  v.userProfile = { email: 'primary@example.com', additionalEmails: [] };
  v.editedUserProfile = { email: 'primary@example.com', additionalEmails: [] };

  v.altEmailSuccess = true;
  v.altEmailError = true;
  v.changes = false;

  v.deleteAlternativeEmail();
  await nextTick();

  expect(v.userProfile?.additionalEmails ?? []).toEqual([]);
  expect(v.editedUserProfile?.additionalEmails ?? []).toEqual([]);
  expect(v.altEmailSuccess).toBe(false);
  expect(v.altEmailError).toBe(false);
  expect(v.changes).toBe(true);
});

test('resetForm is idempotent (already clean state stays clean)', async () => {
  const v = vm();

  v.alternativeEmail = '';
  v.isEmailInvalid = false;
  v.emailErrorMessage = '';

  v.resetForm();
  await nextTick();

  expect(v.alternativeEmail).toBe('');
  expect(v.isEmailInvalid).toBe(false);
  expect(v.emailErrorMessage).toBe('');
});
  });
});

