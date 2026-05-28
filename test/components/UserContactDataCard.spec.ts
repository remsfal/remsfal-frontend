import { describe, test, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import UserContactDataCard from '@/components/UserContactDataCard.vue';
import { nextTick } from 'vue';

vi.mock('@/services/UserService', () => ({
  userService: {
    getUser: vi.fn().mockResolvedValue({
      email: 'primary@example.com',
      firstName: 'Max',
      lastName: 'Mustermann',
      mobilePhoneNumber: '',
      businessPhoneNumber: '',
      privatePhoneNumber: '',
      locale: 'de',
      additionalEmails: [],
    }),
    updateUser: vi.fn().mockResolvedValue({
      email: 'primary@example.com',
      firstName: 'Max',
      lastName: 'Mustermann',
      mobilePhoneNumber: '',
      businessPhoneNumber: '',
      privatePhoneNumber: '',
      locale: 'de',
      additionalEmails: [],
    }),
  },
}));

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

  beforeEach(() => {
    wrapper = mount(UserContactDataCard);
  });

  test('renders without errors', () => {
    expect(wrapper.exists()).toBe(true);
  });

  describe('Alternative email dialog', () => {
    beforeEach(() => {
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
      await nextTick();

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
      await nextTick();

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
      await nextTick();

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
      await nextTick();

      expect(v.additionalEmails).toEqual(['alt@example.com']);
      expect(v.dialogVisible).toBe(false);
    });

    test('empty input after trim keeps dialog open', async () => {
      const v = vm();
      v.dialogVisible = true;
      v.alternativeEmailInput = '   ';

      v.saveAlternativeEmail();
      await nextTick();

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
      await nextTick();

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
      await nextTick();

      expect(v.altEmailDirty).toBe(true);
    });

    test('resetAltEmailDialog clears dialog state', async () => {
      const v = vm();
      v.alternativeEmailInput = 'old@example.com';
      v.isEmailInvalid = true;
      v.emailErrorMessage = 'Fehler';

      v.resetAltEmailDialog();
      await nextTick();

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
      await nextTick();

      expect(v.alternativeEmailInput).toBe('');
      expect(v.isEmailInvalid).toBe(false);
      expect(v.emailErrorMessage).toBe('');
    });
  });
});
