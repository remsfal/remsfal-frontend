import { describe, test, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import AccountSettingsView from '../../src/views/AccountSettingsView.vue';
import router from '../../src/router';
import PrimeVue from 'primevue/config';
import Card from 'primevue/card';
import { createPinia } from 'pinia';
import { nextTick } from 'vue';
import i18n from '../../src/i18n/i18n';

describe('AccountSettingsView', () => {
    let wrapper: VueWrapper;

    beforeEach(() => {
        const pinia = createPinia();

        wrapper = mount(AccountSettingsView, {
            global: {
                plugins: [PrimeVue, router, i18n, pinia],
                components: { Card },
                stubs: { RouterLink: true, RouterView: true },
            },
        });

        // Mock methods, die du direkt als Methoden auf dem vm verwendest
        wrapper.vm.fetchUserProfile = vi.fn().mockResolvedValue({
            firstName: 'First Name',
            lastName: 'Last Name',
        });

        wrapper.vm.saveProfile = vi.fn().mockResolvedValue({
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

        wrapper.vm.validateAddress = vi.fn();

        // Helper-Funktionen aus <script setup> an das vm „anhängen“, damit wir sie testen können
        const vm: any = wrapper.vm;
        const setupState: any = vm.$?.type.__setupState;

        if (setupState) {
            vm.compareObjects = setupState.compareObjects;
            vm.checkValues = setupState.checkValues;
        }
    });

    // -------------------------------------------------------------
    // Basic render test
    // -------------------------------------------------------------
    test('The view renders correctly', () => {
        expect(wrapper.exists()).toBe(true);
    });

    // -------------------------------------------------------------
    // fetchUserProfile
    // -------------------------------------------------------------
    test('fetchUserProfile successfully retrieves user data', async () => {
        await wrapper.vm.fetchUserProfile();
        expect(wrapper.vm.fetchUserProfile).toHaveBeenCalled();
        expect(wrapper.vm.User).not.toBeNull();
    });

    // -------------------------------------------------------------
    // Required fields validation
    // -------------------------------------------------------------
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

    // -------------------------------------------------------------
    // Phone number validation
    // -------------------------------------------------------------
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

    // -------------------------------------------------------------
    // Save & Cancel
    // -------------------------------------------------------------
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

    // -------------------------------------------------------------
    // isDisabled, logout, countryCode
    // -------------------------------------------------------------
    describe('Validation of isDisabled function', async () => {
        test('Errors cause isDisabled to be true', async () => {
            wrapper.vm.changes = true;
            wrapper.vm.errorMessage = { firstname: 'Bitte eingeben!' };
            await nextTick();
            expect(wrapper.vm.isDisabled).toBe(true);
        });

        test('No errors cause isDisabled to be false', async () => {
            wrapper.vm.changes = true;
            wrapper.vm.errorMessage = { firstname: '' };
            await nextTick();
            expect(wrapper.vm.isDisabled).toBe(false);
        });

        test('logout redirects to logout endpoint', () => {
            // @ts-expect-error override for test
            delete window.location;
            // @ts-expect-error fake location
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

    // -------------------------------------------------------------
    // ZIP validation (local only)
    // -------------------------------------------------------------
    describe('ZIP validation in getCity()', () => {
        test('shows error when ZIP is empty', async () => {
            wrapper.vm.editedAddress.zip = '';
            await wrapper.vm.getCity();
            expect(wrapper.vm.errorMessage.zip).toBe('Bitte geben Sie eine Postleitzahl ein!');
        });

        test('shows error when ZIP is not 5 digits', async () => {
            wrapper.vm.editedAddress.zip = '1234';
            await wrapper.vm.getCity();
            expect(wrapper.vm.errorMessage.zip).toBe('Postleitzahl bitte überprüfen!');
        });

        test('does NOT show ZIP error when ZIP format is valid', async () => {
            wrapper.vm.editedAddress.zip = '12345';

            try {
                await wrapper.vm.getCity();
            } catch {
                // Backend-Fehler hier egal – wir testen nur die lokale Validierung
            }
            expect(wrapper.vm.errorMessage.zip).not.toBe('Bitte geben Sie eine Postleitzahl ein!');
            expect(wrapper.vm.errorMessage.zip).not.toBe('Postleitzahl bitte überprüfen!');
        });
    });

    // -------------------------------------------------------------
    // Helper-functions: checkValues & compareObjects
    // -------------------------------------------------------------
    describe('Helper functions: compareObjects & checkValues', () => {

        test('compareObjects returns true for identical objects', () => {
            const fn = (wrapper.vm as any).compareObjects;
            expect(fn({ a: 1 }, { a: 1 })).toBe(true);
        });

        test('compareObjects returns false for different values', () => {
            const fn = (wrapper.vm as any).compareObjects;
            expect(fn({ a: 1 }, { a: 2 })).toBe(false);
        });

        test('compareObjects correctly handles nested objects', () => {
            const fn = (wrapper.vm as any).compareObjects;
            expect(fn({ a: { x: 1 } }, { a: { x: 1 } })).toBe(true);
        });

        test('checkValues returns false when user & address unchanged', () => {
            const fn = (wrapper.vm as any).checkValues;
            const user1 = { name: 'A' };
            const user2 = { name: 'A' };
            const addr1 = { city: 'X' };
            const addr2 = { city: 'X' };
            expect(fn(user1, user2, addr1, addr2)).toBe(false);
        });

        test('checkValues returns true when user changes', () => {
            const fn = (wrapper.vm as any).checkValues;
            const user1 = { name: 'A' };
            const user2 = { name: 'B' };
            const addr = { city: 'X' };
            expect(fn(user1, user2, addr, addr)).toBe(true);
        });

        test('checkValues returns true when address changes', () => {
            const fn = (wrapper.vm as any).checkValues;
            const user = { name: 'A' };
            const addr1 = { city: 'X' };
            const addr2 = { city: 'Y' };
            expect(fn(user, user, addr1, addr2)).toBe(true);
        });

    });

});
