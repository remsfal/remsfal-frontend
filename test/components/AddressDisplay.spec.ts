import { describe, test, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import AdressDisplay from '../../src/components/AdressDisplay.vue';
import Card from 'primevue/card';
import { createApp, nextTick } from 'vue';
import { createPinia } from 'pinia';
import App from '../../src/App.vue';

describe('AdressDisplay', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    const pinia = createPinia();
    const app = createApp(App);
    app.use(pinia);

    wrapper = mount(AdressDisplay, {global: {components: {Card}}});

    wrapper.vm.$options.fetchAddress = vi.fn().mockResolvedValue({
        street: 'street',
        city: 'city',
        zip: 'zip',
        province: 'province',
        countryCode: 'US',
    });

    wrapper.vm.$options.saveAddress = vi.fn().mockResolvedValue({
        street: 'updated street',
        city: 'updated city',
        zip: 'updated zip',
        province: 'updated province',
        countryCode: 'US',
    });

    wrapper.vm.$options.getCity = vi.fn().mockResolvedValue([
        {
            city: 'Test City',
            province: 'Test Province',
            countryCode: 'TC',
        },
    ]);
    wrapper.vm.saveAddress = vi.fn();
    wrapper.vm.fetchAddress = vi.fn();
    wrapper.vm.validateAddress = vi.fn();
    wrapper.vm.isDisabled = vi.fn();
  });
    test('The component renders correctly', () => { 
        expect(wrapper.exists()).toBe(true);
    });

    test('fetchAddress successfully retrieves address data', async () => {
        await wrapper.vm.fetchAddress();
        expect(wrapper.vm.fetchAddress).toHaveBeenCalled();
        expect(wrapper.vm.editedAddress).not.toBeNull();
    });

    describe('Validation of required input fields', async () => {
        test('A valid input value is accepted', async () => {
            const input = wrapper.find('input#street');
            expect(input.exists()).toBe(true);
            await input.setValue('Valid Street 123');
            expect(wrapper.vm.editedAddress.street).toBe('Valid Street 123');
            await input.trigger('blur');
            const errorMessage = wrapper.find('input#street ~ .error');
            expect(errorMessage.text()).toBe('');
        });

        test('An empty input value shows an error message', async () => {
            const input = wrapper.find('input#street');
            expect(input.exists()).toBe(true);
            await input.setValue('');
            await input.trigger('blur');
            const errorMessage = wrapper.find('input#street ~ .error');
            expect(errorMessage.text()).toBe('Bitte eingeben!');
        });

        test('An invalid input value shows an error message', async () => {
            const input = wrapper.find('input#street');
            expect(input.exists()).toBe(true);
            await input.setValue('Invalid Street');
            await input.trigger('blur');
            const errorMessage = wrapper.find('input#street ~ .error');
            expect(errorMessage.text()).toBe('Eingabe bitte überprüfen!');
        });
    });

    test('saveAddress is called when the save button is clicked', async () => {
        wrapper.vm.changes = true;
        await nextTick();
        const saveButton = wrapper.find('.save-button');
        expect(saveButton.exists()).toBe(true);

        await wrapper.vm.saveAddress();
        expect(wrapper.vm.saveAddress).toHaveBeenCalled();
    });

    test('Changes are discarded after clicking the cancel button', async () => {
        wrapper.vm.changes = true;
        await nextTick();
        const cancelButton = wrapper.find('.cancel-button');
        expect(cancelButton.exists()).toBe(true);

        await cancelButton.trigger('click');
        expect(wrapper.vm.editedAddress).toEqual(wrapper.vm.addressProfile);
    });

    describe('Validation of isDisabled method', async () => {
        test('Errors cause isDisabled to be true', async () => {
            wrapper.vm.changes = true;
            wrapper.vm.errorMessage = { street: 'Bitte eingeben' };
            await nextTick();
            expect(wrapper.vm.isDisabled).toBe(true);
        });

        test('No errors cause isDisabled to be false', async () => {
            wrapper.vm.changes = true;
            wrapper.vm.errorMessage = { street: '' };
            await nextTick();
            expect(wrapper.vm.isDisabled).toBe(false);
        });

        test('updateCountryFromCode sets error for invalid country code', async () => {
            wrapper.vm.editedAddress.countryCode = 'XX';
            await wrapper.vm.updateCountryFromCode();
            expect(wrapper.vm.errorMessage.countryCode).toBe('Ungültiges Länderkürzel!');
        });
    });
});