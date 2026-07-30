import { describe, it, expect, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import ReturnKeyDialog from '@/features/project/rentalAgreements/components/ReturnKeyDialog.vue';
import type { RentalAgreementKeysJson } from '@/features/project/rentalAgreements/services/RentalAgreementService';

const BaseDialogStub = {
  name: 'BaseDialog',
  inheritAttrs: false,
  template: '<div data-testid="dialog" :data-visible="String($attrs.visible)"><slot /></div>',
};

const outstandingKeys: RentalAgreementKeysJson[] = [
  {
    amountOfKeys: 2, keyDescription: 'Haustürschlüssel', issuedAt: '2024-01-01' 
  },
  {
    amountOfKeys: 1, keyDescription: 'Briefkastenschlüssel', issuedAt: '2024-01-01' 
  },
];

describe('ReturnKeyDialog', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    wrapper = mount(ReturnKeyDialog, {
      props: { keys: outstandingKeys },
      global: { stubs: { BaseDialog: BaseDialogStub } },
    });
  });

  it('shows the outstanding key descriptions as selectable options', async () => {
    await wrapper.find('button').trigger('click');

    const select = wrapper.findComponent({ name: 'Select' });
    expect(select.props('options')).toEqual(['Briefkastenschlüssel', 'Haustürschlüssel']);
  });

  it('closes the dialog without emitting keyReturned when cancelled', async () => {
    await wrapper.find('button').trigger('click');

    const cancelButton = wrapper.findAll('button').find((btn) => btn.text().includes('Abbrechen'));
    await cancelButton?.trigger('click');

    const dialog = wrapper.find('[data-testid="dialog"]');
    expect(dialog.attributes('data-visible')).toBe('false');
    expect(wrapper.emitted('keyReturned')).toBeFalsy();
  });

  it('disables the "return all" button until a key description is selected', async () => {
    await wrapper.find('button').trigger('click');

    const returnAllButton = wrapper.findAll('button').find((btn) => btn.text().includes('Alle zurückgeben'));
    expect(returnAllButton?.attributes('disabled')).toBeDefined();

    const select = wrapper.findComponent({ name: 'Select' });
    (select.vm as unknown as { writeValue: (v: string) => void }).writeValue('Haustürschlüssel');
    await wrapper.vm.$nextTick();

    expect(returnAllButton?.attributes('disabled')).toBeUndefined();
  });

  it('fills in the full outstanding amount and defaults the return date to today', async () => {
    await wrapper.find('button').trigger('click');

    const select = wrapper.findComponent({ name: 'Select' });
    (select.vm as unknown as { writeValue: (v: string) => void }).writeValue('Haustürschlüssel');
    await wrapper.vm.$nextTick();

    const returnAllButton = wrapper.findAll('button').find((btn) => btn.text().includes('Alle zurückgeben'));
    await returnAllButton?.trigger('click');
    await wrapper.vm.$nextTick();

    const amountInput = wrapper.findComponent({ name: 'InputNumber' });
    expect((amountInput.vm as unknown as { d_value: number }).d_value).toBe(2);

    const datePicker = wrapper.findComponent({ name: 'DatePicker' });
    const returnedAtValue = (datePicker.vm as unknown as { d_value: Date }).d_value;
    expect(returnedAtValue).toBeInstanceOf(Date);
    expect(returnedAtValue.toDateString()).toBe(new Date().toDateString());
  });

  it('does not override an already selected return date', async () => {
    await wrapper.find('button').trigger('click');

    const select = wrapper.findComponent({ name: 'Select' });
    (select.vm as unknown as { writeValue: (v: string) => void }).writeValue('Haustürschlüssel');

    const datePicker = wrapper.findComponent({ name: 'DatePicker' });
    const chosenDate = new Date('2024-06-15');
    (datePicker.vm as unknown as { writeValue: (v: Date) => void }).writeValue(chosenDate);
    await wrapper.vm.$nextTick();

    const returnAllButton = wrapper.findAll('button').find((btn) => btn.text().includes('Alle zurückgeben'));
    await returnAllButton?.trigger('click');
    await wrapper.vm.$nextTick();

    const returnedAtValue = (datePicker.vm as unknown as { d_value: Date }).d_value;
    expect(returnedAtValue.toDateString()).toBe(chosenDate.toDateString());
  });
});
