import { describe, test, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises, VueWrapper } from '@vue/test-utils';
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
  id: 'user-1',
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
  currentAltEmail: string;
  altEmailLocked: boolean;
  altEmailDirty: boolean;
  altEmailSuccess: boolean;
  altEmailError: boolean;
};

describe('UserContactDataCard', () => {
  let wrapper: VueWrapper;

  const vm = (): UserContactDataCardVm => wrapper.vm as unknown as UserContactDataCardVm;

  const mountCard = () => mount(UserContactDataCard, { global: { stubs: { PhoneInput: true } } });

  const submitForm = async () => {
    await wrapper.findComponent(Form).vm.$emit('submit', {
      valid: true,
      states: {
        firstName: { value: 'Max' }, lastName: { value: 'Mustermann' }, locale: { value: 'de' }
      },
    });
    await flushPromises();
  };

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
      id: 'user-1',
      email: '',
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
      id: 'user-1',
      email: '',
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

  test('shows the error icon next to the alternative email when saving fails', async () => {
    await flushPromises();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await wrapper.find('input#alternativeEmail').setValue('alt@example.com');
    vi.mocked(userService.updateUser).mockRejectedValue(new Error('save failed'));

    await submitForm();

    expect(vm().altEmailError).toBe(true);
    expect(wrapper.find('i.pi-times').exists()).toBe(true);
    consoleErrorSpy.mockRestore();
  });

  test('does not submit when the form is invalid', async () => {
    await flushPromises();

    const form = wrapper.findComponent(Form);
    await form.vm.$emit('submit', { valid: false, states: {} });
    await flushPromises();

    expect(userService.updateUser).not.toHaveBeenCalled();
  });

  test('logs and shows no toast when saving fails', async () => {
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

    expect(addMock).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });


  describe('Alternative email', () => {
    const altInput = () => wrapper.find('input#alternativeEmail');
    const trashButton = () => wrapper.find('button[aria-label="Löschen"]');

    test('is editable without trash button when no alternative email is saved', async () => {
      await flushPromises();

      expect((altInput().element as HTMLInputElement).disabled).toBe(false);
      expect(trashButton().exists()).toBe(false);
    });

    test('is locked with trash button when an alternative email is saved', async () => {
      vi.mocked(userService.getUser).mockResolvedValue({
        ...mockProfile,
        additionalEmails: ['alt@example.com'],
      });
      wrapper = mountCard();
      await flushPromises();

      expect((altInput().element as HTMLInputElement).value).toBe('alt@example.com');
      expect((altInput().element as HTMLInputElement).disabled).toBe(true);
      expect(trashButton().exists()).toBe(true);
    });

    test('shows a hint when the saved alternative email is not verified yet', async () => {
      vi.mocked(userService.getUser).mockResolvedValue({
        ...mockProfile,
        additionalEmails: ['alt@example.com'],
        verifiedAdditionalEmails: [],
      });
      wrapper = mountCard();
      await flushPromises();

      expect(wrapper.text()).toContain('Bitte bestätigen Sie die E-Mail.');

      await trashButton().trigger('click');

      expect(wrapper.text()).not.toContain('Bitte bestätigen Sie die E-Mail.');
    });

    test('shows no hint when the saved alternative email is verified', async () => {
      vi.mocked(userService.getUser).mockResolvedValue({
        ...mockProfile,
        additionalEmails: ['alt@example.com'],
        verifiedAdditionalEmails: ['alt@example.com'],
      });
      wrapper = mountCard();
      await flushPromises();

      expect(wrapper.text()).not.toContain('Bitte bestätigen Sie die E-Mail.');
    });

    test('saves a new alternative email and locks the field afterwards', async () => {
      await flushPromises();
      await altInput().setValue('  alt@example.com  ');
      expect(vm().altEmailDirty).toBe(true);
      vi.mocked(userService.updateUser).mockResolvedValue({
        ...mockProfile,
        additionalEmails: ['alt@example.com'],
      });

      await submitForm();

      expect(userService.updateUser).toHaveBeenCalledWith(
        expect.objectContaining({ additionalEmails: ['alt@example.com'] }),
      );
      expect(vm().altEmailLocked).toBe(true);
      expect(vm().altEmailDirty).toBe(false);
      expect((altInput().element as HTMLInputElement).disabled).toBe(true);
      expect(trashButton().exists()).toBe(true);
    });

    test('does not send additionalEmails when the field was not changed', async () => {
      await flushPromises();

      await submitForm();

      expect(userService.updateUser).toHaveBeenCalledWith(
        expect.objectContaining({ additionalEmails: undefined }),
      );
    });

    test('trash button clears and unlocks the field and saving removes the email', async () => {
      vi.mocked(userService.getUser).mockResolvedValue({
        ...mockProfile,
        additionalEmails: ['alt@example.com'],
      });
      wrapper = mountCard();
      await flushPromises();

      await trashButton().trigger('click');

      expect(vm().currentAltEmail).toBe('');
      expect(vm().altEmailLocked).toBe(false);
      expect((altInput().element as HTMLInputElement).disabled).toBe(false);
      expect(trashButton().exists()).toBe(false);

      await submitForm();

      expect(userService.updateUser).toHaveBeenCalledWith(
        expect.objectContaining({ additionalEmails: [] }),
      );
    });

    test('shows the email confirmation toast in addition to the profile toast', async () => {
      await flushPromises();
      await altInput().setValue('alt@example.com');
      vi.mocked(userService.updateUser).mockResolvedValue({
        ...mockProfile,
        additionalEmails: ['alt@example.com'],
      });

      await submitForm();

      expect(addMock).toHaveBeenCalledTimes(2);
      expect(addMock).toHaveBeenCalledWith(expect.objectContaining({
        severity: 'success',
        detail: 'Profil wurde erfolgreich gespeichert.',
      }));
      expect(addMock).toHaveBeenCalledWith(expect.objectContaining({
        severity: 'success',
        detail: 'E-Mail erfolgreich gespeichert. Bitte schauen Sie in Ihre E-Mails, um die E-Mail zu bestätigen.',
      }));
    });

    test('shows only the profile toast when the alternative email is removed', async () => {
      vi.mocked(userService.getUser).mockResolvedValue({
        ...mockProfile,
        additionalEmails: ['alt@example.com'],
      });
      wrapper = mountCard();
      await flushPromises();
      await trashButton().trigger('click');

      await submitForm();

      expect(addMock).toHaveBeenCalledTimes(1);
      expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ detail: 'Profil wurde erfolgreich gespeichert.' }));
    });

    test('shows an error toast when saving the alternative email fails', async () => {
      await flushPromises();
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      await altInput().setValue('alt@example.com');
      vi.mocked(userService.updateUser).mockRejectedValue(new Error('save failed'));

      await submitForm();

      expect(addMock).toHaveBeenCalledTimes(1);
      expect(addMock).toHaveBeenCalledWith(expect.objectContaining({
        severity: 'error',
        detail: 'E-Mail konnte nicht gespeichert werden.',
      }));
      consoleErrorSpy.mockRestore();
    });

    test('saves the profile without an invalid alternative email and shows both toasts', async () => {
      await flushPromises();
      await altInput().setValue('not-an-email');

      await submitForm();

      expect(userService.updateUser).toHaveBeenCalledWith(
        expect.objectContaining({ additionalEmails: undefined }),
      );
      expect(addMock).toHaveBeenCalledTimes(2);
      expect(addMock).toHaveBeenCalledWith(expect.objectContaining({
        severity: 'success',
        detail: 'Profil wurde erfolgreich gespeichert.',
      }));
      expect(addMock).toHaveBeenCalledWith(expect.objectContaining({
        severity: 'error',
        detail: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
      }));
      expect(vm().currentAltEmail).toBe('not-an-email');
      expect(vm().altEmailLocked).toBe(false);
    });
  });
});
