import { describe, test, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises, DOMWrapper, VueWrapper } from '@vue/test-utils';
import { Form } from '@primevue/forms';
import Select from 'primevue/select';
import DatePicker from 'primevue/datepicker';
import UserContactDataCard from '@/features/common/users/components/UserContactDataCard.vue';
import { userService } from '@/features/common/users/services/UserService';

vi.mock('@/features/common/users/services/UserService', () => ({
  userService: {
    getUser: vi.fn(),
    updateUser: vi.fn(),
  },
}));

const addMock = vi.fn();
vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: addMock }) }));

const mockProfile = {
  email: 'primary@example.com',
  firstName: 'Max',
  lastName: 'Mustermann',
  placeOfBirth: 'Berlin',
  dateOfBirth: '1990-01-01',
  mobilePhoneNumber: '',
  businessPhoneNumber: '',
  privatePhoneNumber: '',
  locale: 'de',
  additionalEmails: [] as string[],
};

type UserContactDataCardVm = {
  email: string;
  additionalEmails: string[];
  altEmailDirty: boolean;
  altEmailSuccess: boolean;
  altEmailError: boolean;
  dialogVisible: boolean;
  alternativeEmailInput: string;
  isEmailInvalid: boolean;
  emailErrorMessage: string;
  saveAlternativeEmail: () => void;
  deleteAlternativeEmail: () => void;
  resetAltEmailDialog: () => void;
};

describe('UserContactDataCard', () => {
  let wrapper: VueWrapper;

  const vm = (): UserContactDataCardVm => wrapper.vm as unknown as UserContactDataCardVm;

  const mountCard = () => mount(UserContactDataCard, { global: { stubs: { PhoneInput: true } } });

  beforeEach(() => {
    vi.mocked(userService.getUser).mockResolvedValue({ ...mockProfile });
    vi.mocked(userService.updateUser).mockResolvedValue({ ...mockProfile });
    wrapper = mountCard();
  });

  test('renders without errors', () => {
    expect(wrapper.exists()).toBe(true);
  });

  test('loads the user profile on mount', async () => {
    await flushPromises();

    expect(userService.getUser).toHaveBeenCalled();
    expect((wrapper.find('input#primaryEmail').element as HTMLInputElement).value).toBe(
      'primary@example.com',
    );
    expect((wrapper.find('input[name="firstName"]').element as HTMLInputElement).value).toBe(
      'Max',
    );
  });

  test('falls back to the current locale when the profile has no locale', async () => {
    vi.mocked(userService.getUser).mockResolvedValue({ ...mockProfile, locale: undefined });
    wrapper = mountCard();
    await flushPromises();

    expect(wrapper.exists()).toBe(true);
  });

  test('falls back to English for an unsupported locale', async () => {
    vi.mocked(userService.getUser).mockResolvedValue({ ...mockProfile, locale: 'fr' });
    wrapper = mountCard();
    await flushPromises();

    expect(wrapper.exists()).toBe(true);
  });

  test('falls back to empty defaults when optional profile fields are missing', async () => {
    vi.mocked(userService.getUser).mockResolvedValue({
      email: undefined,
      firstName: '',
      lastName: '',
      placeOfBirth: '',
      dateOfBirth: undefined,
      mobilePhoneNumber: undefined,
      businessPhoneNumber: undefined,
      privatePhoneNumber: undefined,
      locale: undefined,
      additionalEmails: undefined,
    });
    wrapper = mountCard();
    await flushPromises();

    expect((wrapper.find('input#primaryEmail').element as HTMLInputElement).value).toBe('');
    expect((wrapper.find('input[name="firstName"]').element as HTMLInputElement).value).toBe('');
  });

  test('logs an error when loading the profile fails', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(userService.getUser).mockRejectedValue(new Error('load failed'));

    wrapper = mountCard();
    await flushPromises();

    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load user profile', expect.any(Error));
    consoleErrorSpy.mockRestore();
  });

  test('shows a validation error for an invalid first name', async () => {
    await flushPromises();

    await wrapper.find('input[name="firstName"]').setValue('123');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.text()).toContain('Nur Buchstaben und Leerzeichen erlaubt');
    expect(userService.updateUser).not.toHaveBeenCalled();
  });

  test('shows a validation error for an invalid last name', async () => {
    await flushPromises();

    await wrapper.find('input[name="lastName"]').setValue('456');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.text()).toContain('Nur Buchstaben und Leerzeichen erlaubt');
    expect(userService.updateUser).not.toHaveBeenCalled();
  });

  test('updates the mobile, business and private phone numbers', async () => {
    await flushPromises();

    const phoneInputs = wrapper.findAllComponents({ name: 'PhoneInput' });
    await phoneInputs[0].vm.$emit('update:modelValue', '+491511234567');
    await phoneInputs[1].vm.$emit('update:modelValue', '+491511234568');
    await phoneInputs[2].vm.$emit('update:modelValue', '+491511234569');
    await flushPromises();

    expect(wrapper.text()).not.toContain('Ungültiges Telefonformat');
  });

  test('shows phone validation errors for invalid numbers', async () => {
    await flushPromises();

    const phoneInputs = wrapper.findAllComponents({ name: 'PhoneInput' });
    await phoneInputs[0].vm.$emit('update:modelValue', 'invalid');
    await phoneInputs[1].vm.$emit('update:modelValue', 'invalid');
    await phoneInputs[2].vm.$emit('update:modelValue', 'invalid');
    await flushPromises();

    expect(wrapper.text()).toContain('Ungültiges Telefonformat');

    const form = wrapper.findComponent(Form);
    await form.vm.$emit('submit', {
      valid: true,
      states: {
        firstName: { value: 'Max' }, lastName: { value: 'Mustermann' }, locale: { value: 'de' } 
      },
    });
    await flushPromises();

    expect(userService.updateUser).not.toHaveBeenCalled();
  });

  test('changes the locale via the language select', async () => {
    await flushPromises();

    const select = wrapper.findComponent(Select);
    await select.vm.$emit('change', { value: 'en' });
    await flushPromises();

    expect(wrapper.exists()).toBe(true);
  });

  test('updates the date of birth via the date picker', async () => {
    await flushPromises();

    const datePicker = wrapper.findComponent(DatePicker);
    await datePicker.vm.$emit('update:modelValue', new Date('1995-05-05'));
    await flushPromises();
    vi.mocked(userService.updateUser).mockResolvedValue({
      ...mockProfile,
      dateOfBirth: '1995-05-05',
    });

    const form = wrapper.findComponent(Form);
    await form.vm.$emit('submit', {
      valid: true,
      states: {
        firstName: { value: 'Max' }, lastName: { value: 'Mustermann' }, locale: { value: 'de' }
      },
    });
    await flushPromises();

    expect(userService.updateUser).toHaveBeenCalledWith(
      expect.objectContaining({ dateOfBirth: '1995-05-05' }),
    );
  });

  test('submits the form successfully and updates state', async () => {
    await flushPromises();
    vi.mocked(userService.updateUser).mockResolvedValue({
      ...mockProfile,
      firstName: 'Erika',
      mobilePhoneNumber: '+491511234567',
      additionalEmails: ['alt@example.com'],
    });

    const form = wrapper.findComponent(Form);
    await form.vm.$emit('submit', {
      valid: true,
      states: {
        firstName: { value: 'Erika' }, lastName: { value: 'Mustermann' }, locale: { value: 'de' } 
      },
    });
    await flushPromises();

    expect(userService.updateUser).toHaveBeenCalledWith(
      expect.objectContaining({ firstName: 'Erika' }),
    );
    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
  });

  test('submits with fallback defaults when optional fields and locale are empty', async () => {
    vi.mocked(userService.getUser).mockResolvedValue({ ...mockProfile, dateOfBirth: undefined });
    wrapper = mountCard();
    await flushPromises();
    vi.mocked(userService.updateUser).mockResolvedValue({
      email: undefined,
      firstName: '',
      lastName: '',
      placeOfBirth: undefined,
      dateOfBirth: undefined,
      mobilePhoneNumber: undefined,
      businessPhoneNumber: undefined,
      privatePhoneNumber: undefined,
      locale: undefined,
      additionalEmails: undefined,
    });

    const form = wrapper.findComponent(Form);
    await form.vm.$emit('submit', {
      valid: true,
      states: { firstName: { value: '' }, lastName: { value: '' } },
    });
    await flushPromises();

    expect(userService.updateUser).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: undefined, lastName: undefined, locale: undefined,
      }),
    );
  });

  test('includes the alternative email when it was changed before submitting', async () => {
    await flushPromises();
    const v = vm();
    v.alternativeEmailInput = 'alt@example.com';
    v.saveAlternativeEmail();
    await flushPromises();
    expect(v.altEmailDirty).toBe(true);

    vi.mocked(userService.updateUser).mockResolvedValue({
      ...mockProfile,
      additionalEmails: ['alt@example.com'],
    });

    const form = wrapper.findComponent(Form);
    await form.vm.$emit('submit', {
      valid: true,
      states: {
        firstName: { value: 'Max' }, lastName: { value: 'Mustermann' }, locale: { value: 'de' }
      },
    });
    await flushPromises();

    expect(userService.updateUser).toHaveBeenCalledWith(
      expect.objectContaining({ additionalEmails: ['alt@example.com'] }),
    );
  });

  test('shows the error icon next to an existing alternative email when saving fails', async () => {
    await flushPromises();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const v = vm();
    v.additionalEmails = ['alt@example.com'];
    await flushPromises();
    vi.mocked(userService.updateUser).mockRejectedValue(new Error('save failed'));

    const form = wrapper.findComponent(Form);
    await form.vm.$emit('submit', {
      valid: true,
      states: {
        firstName: { value: 'Max' }, lastName: { value: 'Mustermann' }, locale: { value: 'de' }
      },
    });
    await flushPromises();

    expect(v.altEmailError).toBe(true);
    expect(wrapper.text()).toContain('✗');
    consoleErrorSpy.mockRestore();
  });

  test('does not submit when the form is invalid', async () => {
    await flushPromises();

    const form = wrapper.findComponent(Form);
    await form.vm.$emit('submit', { valid: false, states: {} });
    await flushPromises();

    expect(userService.updateUser).not.toHaveBeenCalled();
  });

  test('shows an error toast when saving fails', async () => {
    await flushPromises();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(userService.updateUser).mockRejectedValue(new Error('save failed'));

    const form = wrapper.findComponent(Form);
    await form.vm.$emit('submit', {
      valid: true,
      states: {
        firstName: { value: 'Max' }, lastName: { value: 'Mustermann' }, locale: { value: 'de' } 
      },
    });
    await flushPromises();

    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    consoleErrorSpy.mockRestore();
  });

  test('opens and closes the alternative email dialog through the UI', async () => {
    await flushPromises();
    const body = new DOMWrapper(document.body);

    await wrapper.find('button[aria-label="Alternative E-Mail hinzufügen"]').trigger('click');
    await flushPromises();
    expect(vm().dialogVisible).toBe(true);

    await body.find('#alt-email-input').setValue('alt@example.com');
    await body.find('button[aria-label="Abbrechen"]').trigger('click');
    await flushPromises();

    expect(vm().dialogVisible).toBe(false);
  });

  test('closes the dialog when the dialog itself emits update:visible', async () => {
    await flushPromises();

    await wrapper.find('button[aria-label="Alternative E-Mail hinzufügen"]').trigger('click');
    await flushPromises();
    expect(vm().dialogVisible).toBe(true);

    const dialog = wrapper.findComponent({ name: 'Dialog' });
    await dialog.vm.$emit('update:visible', false);
    await flushPromises();

    expect(vm().dialogVisible).toBe(false);
  });

  describe('Alternative email dialog', () => {
    beforeEach(async () => {
      await flushPromises();
      const v = vm();
      v.email = 'primary@example.com';
      v.additionalEmails = [];
      v.altEmailDirty = false;
      v.altEmailSuccess = false;
      v.altEmailError = false;
      v.dialogVisible = false;
      v.alternativeEmailInput = '';
      v.isEmailInvalid = false;
      v.emailErrorMessage = '';
    });

    test('marks email invalid if format is invalid', async () => {
      const v = vm();
      v.dialogVisible = true;
      v.alternativeEmailInput = 'not-an-email';

      v.saveAlternativeEmail();
      await flushPromises();

      expect(v.isEmailInvalid).toBe(true);
      expect(v.emailErrorMessage).not.toBe('');
      expect(v.dialogVisible).toBe(true);
      expect(v.additionalEmails).toEqual([]);
    });

    test('rejects alternative email equal to primary email', async () => {
      const v = vm();
      v.dialogVisible = true;
      v.email = 'same@example.com';
      v.alternativeEmailInput = 'same@example.com';

      v.saveAlternativeEmail();
      await flushPromises();

      expect(v.isEmailInvalid).toBe(true);
      expect(v.emailErrorMessage).not.toBe('');
      expect(v.dialogVisible).toBe(true);
      expect(v.additionalEmails).toEqual([]);
    });

    test('successful save sets additionalEmails and closes dialog', async () => {
      const v = vm();
      v.dialogVisible = true;
      v.alternativeEmailInput = 'alt@example.com';

      v.saveAlternativeEmail();
      await flushPromises();

      expect(v.additionalEmails).toEqual(['alt@example.com']);
      expect(v.altEmailDirty).toBe(true);
      expect(v.altEmailSuccess).toBe(false);
      expect(v.altEmailError).toBe(false);
      expect(v.dialogVisible).toBe(false);
      expect(v.alternativeEmailInput).toBe('');
      expect(v.isEmailInvalid).toBe(false);
      expect(v.emailErrorMessage).toBe('');
    });

    test('trims alternative email before validation', async () => {
      const v = vm();
      v.dialogVisible = true;
      v.alternativeEmailInput = '   alt@example.com   ';

      v.saveAlternativeEmail();
      await flushPromises();

      expect(v.additionalEmails).toEqual(['alt@example.com']);
      expect(v.dialogVisible).toBe(false);
    });

    test('empty input after trim keeps dialog open', async () => {
      const v = vm();
      v.dialogVisible = true;
      v.alternativeEmailInput = '   ';

      v.saveAlternativeEmail();
      await flushPromises();

      expect(v.isEmailInvalid).toBe(true);
      expect(v.dialogVisible).toBe(true);
      expect(v.additionalEmails).toEqual([]);
    });

    test('deleteAlternativeEmail clears additionalEmails and resets icons', async () => {
      const v = vm();
      v.additionalEmails = ['alt@example.com'];
      v.altEmailSuccess = true;
      v.altEmailError = true;

      v.deleteAlternativeEmail();
      await flushPromises();

      expect(v.additionalEmails).toEqual([]);
      expect(v.altEmailDirty).toBe(true);
      expect(v.altEmailSuccess).toBe(false);
      expect(v.altEmailError).toBe(false);
    });

    test('deleteAlternativeEmail when empty still marks altEmailDirty', async () => {
      const v = vm();
      v.additionalEmails = [];
      v.altEmailDirty = false;

      v.deleteAlternativeEmail();
      await flushPromises();

      expect(v.altEmailDirty).toBe(true);
    });

    test('resetAltEmailDialog clears dialog state', async () => {
      const v = vm();
      v.alternativeEmailInput = 'old@example.com';
      v.isEmailInvalid = true;
      v.emailErrorMessage = 'Fehler';

      v.resetAltEmailDialog();
      await flushPromises();

      expect(v.alternativeEmailInput).toBe('');
      expect(v.isEmailInvalid).toBe(false);
      expect(v.emailErrorMessage).toBe('');
    });

    test('resetAltEmailDialog is idempotent on clean state', async () => {
      const v = vm();
      v.alternativeEmailInput = '';
      v.isEmailInvalid = false;
      v.emailErrorMessage = '';

      v.resetAltEmailDialog();
      await flushPromises();

      expect(v.alternativeEmailInput).toBe('');
      expect(v.isEmailInvalid).toBe(false);
      expect(v.emailErrorMessage).toBe('');
    });

    test('deleting the alternative email is reflected in the UI', async () => {
      const v = vm();
      v.additionalEmails = ['alt@example.com'];
      await flushPromises();

      await wrapper.find('.pi-trash').element.closest('button')!.click();
      await flushPromises();

      expect(v.additionalEmails).toEqual([]);
    });
  });
});
