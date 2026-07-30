import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import RentalAgreementKeyCard from '@/features/project/rentalAgreements/components/RentalAgreementKeyCard.vue';
import ReturnKeyDialog from '@/features/project/rentalAgreements/components/ReturnKeyDialog.vue';
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

  it('shows empty state when there are no keys', () => {
    const wrapper = mountCard({ ...baseAgreement, keys: [] });
    expect(wrapper.text()).toContain('Noch keine Schlüssel hinzugefügt.');
  });

  it('renders a row per key with amount and description', () => {
    const wrapper = mountCard();
    expect(wrapper.text()).toContain('Haustürschlüssel');
    expect(wrapper.text()).toContain('Kellerschlüssel');
  });

  it('sorts rows alphabetically when the description column header is clicked', async () => {
    const wrapper = mountCard();
    const descriptionHeader = wrapper.findAll('th').find((th) => th.text().includes('Beschreibung'));
    await descriptionHeader?.trigger('click');

    const bodyRows = wrapper.findAll('tbody tr');
    const firstRowDescription = bodyRows[0]?.findAll('td')[0]?.text();
    expect(firstRowDescription).toBe('Haustürschlüssel');
  });

  it('sorts rows by amount when the amount column header is clicked', async () => {
    const wrapper = mountCard();
    const amountHeader = wrapper.findAll('th').find((th) => th.text().includes('Anzahl'));
    await amountHeader?.trigger('click');

    const bodyRows = wrapper.findAll('tbody tr');
    const firstRowAmount = bodyRows[0]?.findAll('td')[1]?.text();
    expect(firstRowAmount).toBe('1');
  });

  it('shows the returned date only for keys that have been returned', () => {
    const wrapper = mountCard();
    const cells = wrapper.findAll('td').map((td) => td.text());
    expect(cells).toContain('01.02.2024');
    const rowsText = wrapper.findAll('tr').map((tr) => tr.text());
    const outstandingRow = rowsText.find((r) => r.includes('Haustürschlüssel'));
    expect(outstandingRow).not.toContain('01.02.2024');
  });

  it('adds a key via NewKeyDialog and persists via updateRentalAgreement', async () => {
    const wrapper = mountCard();
    const newKeyDialog = wrapper.findComponent({ name: 'NewKeyDialog' });
    expect(newKeyDialog.exists()).toBe(true);

    const newKey = {
      amountOfKeys: 3, keyDescription: 'Garagenschlüssel', issuedAt: '2024-03-01' 
    };
    await newKeyDialog.vm.$emit('newKey', newKey);
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

  it('passes the net outstanding amount per key description to ReturnKeyDialog', () => {
    const wrapper = mountCard();
    const returnKeyDialog = wrapper.findComponent(ReturnKeyDialog);
    expect(returnKeyDialog.props('keys')).toEqual([
      { keyDescription: 'Haustürschlüssel', amountOfKeys: 2 },
    ]);
  });

  it('records a full key return as a new history entry without altering the issued entry', async () => {
    const wrapper = mountCard();
    const returnKeyDialog = wrapper.findComponent(ReturnKeyDialog);

    await returnKeyDialog.vm.$emit('keyReturned', {
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
    const returnKeyDialog = wrapper.findComponent(ReturnKeyDialog);

    await returnKeyDialog.vm.$emit('keyReturned', {
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
    const returnKeyDialog = wrapper.findComponent(ReturnKeyDialog);

    expect(returnKeyDialog.props('keys')).toEqual([
      { keyDescription: 'Briefkastenschlüssel', amountOfKeys: 3 },
    ]);

    await returnKeyDialog.vm.$emit('keyReturned', {
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
    const newKeyDialog = wrapper.findComponent({ name: 'NewKeyDialog' });
    await newKeyDialog.vm.$emit('newKey', {
      amountOfKeys: 1, keyDescription: 'Dachbodenschlüssel', issuedAt: '2024-01-01' 
    });
    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(toastSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    consoleSpy.mockRestore();
  });

  it('does not call updateRentalAgreement when the rental agreement has no id', async () => {
    const wrapper = mountCard({ ...baseAgreement, id: undefined });
    const newKeyDialog = wrapper.findComponent({ name: 'NewKeyDialog' });
    await newKeyDialog.vm.$emit('newKey', {
      amountOfKeys: 1, keyDescription: 'Dachbodenschlüssel', issuedAt: '2024-01-01' 
    });
    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(rentalAgreementService.updateRentalAgreement).not.toHaveBeenCalled();
  });
});
