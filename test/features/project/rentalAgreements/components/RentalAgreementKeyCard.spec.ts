import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import RentalAgreementKeyCard from '@/features/project/rentalAgreements/components/RentalAgreementKeyCard.vue';
import ReturnKeyButton from '@/features/project/rentalAgreements/components/ReturnKeyButton.vue';
import {rentalAgreementService,
  type RentalAgreementJson,} from '@/features/project/rentalAgreements/services/RentalAgreementService';

const toastSpy = vi.fn();
vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: toastSpy }) }));

const baseAgreement: RentalAgreementJson = {
  id: 'agreement-1',
  keys: [
    {
      amountOfKeys: 2, keyDescription: 'Haustürschlüssel', issuedAt: '2024-01-01' 
    },
    {
      amountOfKeys: 1, keyDescription: 'Kellerschlüssel', issuedAt: '2024-01-01', returnedAt: '2024-02-01' 
    },
  ],
};

describe('RentalAgreementKeyCard', () => {
  beforeEach(() => {
    vi.spyOn(rentalAgreementService, 'updateRentalAgreement').mockResolvedValue(undefined);
  });

  const mountCard = (agreement: RentalAgreementJson = baseAgreement) =>
    mount(RentalAgreementKeyCard, {props: { projectId: 'proj-1', rentalAgreement: agreement },});

  it('renders a row per key with amount and description', () => {
    const wrapper = mountCard();
    expect(wrapper.text()).toContain('Haustürschlüssel');
    expect(wrapper.text()).toContain('Kellerschlüssel');
  });

  it('adds a key via NewKeyButton and persists via updateRentalAgreement', async () => {
    const wrapper = mountCard();
    const newKeyButton = wrapper.findComponent({ name: 'NewKeyButton' });
    expect(newKeyButton.exists()).toBe(true);

    const newKey = {
      amountOfKeys: 3, keyDescription: 'Garagenschlüssel', issuedAt: '2024-03-01' 
    };
    await newKeyButton.vm.$emit('newKey', newKey);
    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 0));

    const expectedKeys = [...baseAgreement.keys!, newKey];
    expect(rentalAgreementService.updateRentalAgreement)
      .toHaveBeenCalledWith('proj-1', 'agreement-1', { keys: expectedKeys });

    const emitted = wrapper.emitted('update:rentalAgreement');
    expect(emitted).toBeTruthy();
    const updatedAgreement = emitted![0][0] as RentalAgreementJson;
    expect(updatedAgreement.keys).toEqual([...baseAgreement.keys!, newKey]);
    expect(toastSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
  });

  it('passes the net outstanding amount per key description to ReturnKeyButton', () => {
    const wrapper = mountCard();
    const returnKeyButton = wrapper.findComponent(ReturnKeyButton);
    expect(returnKeyButton.props('keys')).toEqual([
      { keyDescription: 'Haustürschlüssel', amountOfKeys: 2 },
    ]);
  });

  it('records a full key return as a new history entry without altering the issued entry', async () => {
    const wrapper = mountCard();
    const returnKeyButton = wrapper.findComponent(ReturnKeyButton);

    returnKeyButton.vm.$emit('keyReturned', {
      keyDescription: 'Haustürschlüssel',
      amount: 2,
      returnedAt: '2024-05-01',
    });
    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(rentalAgreementService.updateRentalAgreement).toHaveBeenCalledWith('proj-1', 'agreement-1', {
      keys: [
        {
          amountOfKeys: 2, keyDescription: 'Haustürschlüssel', issuedAt: '2024-01-01'
        },
        {
          amountOfKeys: 1, keyDescription: 'Kellerschlüssel', issuedAt: '2024-01-01', returnedAt: '2024-02-01'
        },
        {
          amountOfKeys: 2, keyDescription: 'Haustürschlüssel', returnedAt: '2024-05-01'
        },
      ],
    });
  });

  it('appends a new history entry for a partial return and leaves the issued entry untouched', async () => {
    const wrapper = mountCard();
    const returnKeyButton = wrapper.findComponent(ReturnKeyButton);

    returnKeyButton.vm.$emit('keyReturned', {
      keyDescription: 'Haustürschlüssel',
      amount: 1,
      returnedAt: '2024-05-01',
    });
    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 0));

    const emitted = wrapper.emitted('update:rentalAgreement');
    const updatedAgreement = emitted![0][0] as RentalAgreementJson;
    const issuedEntry = updatedAgreement.keys!.find(
      (k) => k.keyDescription === 'Haustürschlüssel' && !k.returnedAt,
    );
    const returnedEntry = updatedAgreement.keys!.find(
      (k) => k.keyDescription === 'Haustürschlüssel' && k.returnedAt,
    );
    expect(issuedEntry).toEqual({
      amountOfKeys: 2, keyDescription: 'Haustürschlüssel', issuedAt: '2024-01-01'
    });
    expect(returnedEntry).toEqual({
      amountOfKeys: 1, keyDescription: 'Haustürschlüssel', returnedAt: '2024-05-01'
    });
  });

  it('reduces the outstanding total further after a subsequent partial return', async () => {
    const partiallyReturnedAgreement: RentalAgreementJson = {
      id: 'agreement-1',
      keys: [
        {
          amountOfKeys: 7, keyDescription: 'Briefkastenschlüssel', issuedAt: '2024-01-01'
        },
        {
          amountOfKeys: 4, keyDescription: 'Briefkastenschlüssel', returnedAt: '2024-03-01'
        },
      ],
    };
    const wrapper = mountCard(partiallyReturnedAgreement);
    const returnKeyButton = wrapper.findComponent(ReturnKeyButton);

    expect(returnKeyButton.props('keys')).toEqual([
      { keyDescription: 'Briefkastenschlüssel', amountOfKeys: 3 },
    ]);

    returnKeyButton.vm.$emit('keyReturned', {
      keyDescription: 'Briefkastenschlüssel',
      amount: 3,
      returnedAt: '2024-05-01',
    });
    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 0));

    const emitted = wrapper.emitted('update:rentalAgreement');
    const updatedAgreement = emitted![0][0] as RentalAgreementJson;
    expect(updatedAgreement.keys).toEqual([
      ...partiallyReturnedAgreement.keys!,
      {
        keyDescription: 'Briefkastenschlüssel', amountOfKeys: 3, returnedAt: '2024-05-01' 
      },
    ]);
  });

  it('shows an error toast when saving keys fails', async () => {
    vi.spyOn(rentalAgreementService, 'updateRentalAgreement').mockRejectedValue(new Error('API error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const wrapper = mountCard();
    const newKeyButton = wrapper.findComponent({ name: 'NewKeyButton' });
    await newKeyButton.vm.$emit('newKey', {
      amountOfKeys: 1, keyDescription: 'Dachbodenschlüssel', issuedAt: '2024-01-01' 
    });
    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(toastSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    consoleSpy.mockRestore();
  });
});
