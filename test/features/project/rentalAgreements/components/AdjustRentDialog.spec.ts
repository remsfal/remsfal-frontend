import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import TreeSelect from 'primevue/treeselect';
import AdjustRentDialog, {type RentAdjustmentUnit,} from '@/features/project/rentalAgreements/components/AdjustRentDialog.vue';
import RentalDetailsForm from '@/features/project/rentalAgreements/components/RentalDetailsForm.vue';
import BaseDialog from '@/components/common/BaseDialog.vue';
import RentableUnitSelect from '@/features/project/rentableUnits/components/RentableUnitSelect.vue';
import type { RentalAgreementJson } from '@/features/project/rentalAgreements/services/RentalAgreementService';
import { rentalAgreementService } from '@/features/project/rentalAgreements/services/RentalAgreementService';
import { propertyService } from '@/features/project/rentableUnits/services/PropertyService';

const toastSpy = vi.fn();
vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: toastSpy }) }));

vi.mock('@/features/project/rentableUnits/services/PropertyService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/project/rentableUnits/services/PropertyService')>();
  return {
    ...actual,
    propertyService: { getPropertyTree: vi.fn() },
  };
});

vi.mock('@/features/project/rentalAgreements/services/RentalAgreementService', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('@/features/project/rentalAgreements/services/RentalAgreementService')
  >();
  return {
    ...actual,
    rentalAgreementService: { addRent: vi.fn() },
  };
});

const updatedAgreement: RentalAgreementJson = { id: 'agreement-1' };

describe('AdjustRentDialog', () => {
  const mountDialog = (unit: RentAdjustmentUnit | null) =>
    mount(AdjustRentDialog, {
      props: {
        visible: true,
        projectId: 'proj-1',
        agreementId: 'agreement-1',
        unit,
        excludeUnitIds: [],
      },
      attachTo: document.body,
    });

  const findDialogButton = (text: string) =>
    Array.from(document.querySelectorAll('.p-dialog button')).find(
      (btn) => btn.textContent?.trim() === text,
    ) as HTMLButtonElement | undefined;

  beforeEach(() => {
    vi.mocked(propertyService.getPropertyTree).mockResolvedValue({ properties: [] });
    vi.mocked(rentalAgreementService.addRent).mockResolvedValue(updatedAgreement);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('add mode (unit = null)', () => {
    it('shows the tree-select and the static "add" header', async () => {
      mountDialog(null);
      await flushPromises();

      expect(document.querySelector('.p-dialog-title')?.textContent).toBe('Wirtschaftseinheit hinzufügen');
      expect(document.querySelector('.p-treeselect')).toBeTruthy();
    });

    it('does not show RentalDetailsForm until a unit is selected, and can be cancelled', async () => {
      const wrapper = mountDialog(null);
      await flushPromises();

      expect(wrapper.findComponent(RentalDetailsForm).exists()).toBe(false);

      findDialogButton('Abbrechen')?.click();
      await flushPromises();

      expect(wrapper.emitted('update:visible')?.[0]).toEqual([false]);
    });

    it('shows RentalDetailsForm once a unit is selected in the tree', async () => {
      vi.mocked(propertyService.getPropertyTree).mockResolvedValue({
        properties: [{
          key: 'apt-2', data: {
            id: 'apt-2', type: 'APARTMENT', title: 'Wohnung 5' 
          },
        }],
      });

      const wrapper = mountDialog(null);
      await flushPromises();

      await wrapper.findComponent(TreeSelect).vm.$emit('node-select', {
        key: 'apt-2',
        data: {
          id: 'apt-2', type: 'APARTMENT', title: 'Wohnung 5' 
        },
      });
      await flushPromises();

      expect(wrapper.findComponent(RentalDetailsForm).exists()).toBe(true);
    });

    it('submits with the type/id of the selected unit, emits update, shows success toast, closes', async () => {
      vi.mocked(propertyService.getPropertyTree).mockResolvedValue({
        properties: [{
          key: 'apt-2', data: {
            id: 'apt-2', type: 'APARTMENT', title: 'Wohnung 5' 
          },
        }],
      });

      const wrapper = mountDialog(null);
      await flushPromises();
      await wrapper.findComponent(TreeSelect).vm.$emit('node-select', {
        key: 'apt-2',
        data: {
          id: 'apt-2', type: 'APARTMENT', title: 'Wohnung 5' 
        },
      });
      await flushPromises();

      await wrapper.findComponent(RentalDetailsForm).vm.$emit('submit', {
        basicRent: 500,
        billingCycle: 'MONTHLY',
        firstPaymentDate: '2024-01-01',
      });
      await flushPromises();

      expect(rentalAgreementService.addRent).toHaveBeenCalledWith(
        'proj-1',
        'agreement-1',
        'APARTMENT',
        'apt-2',
        expect.objectContaining({
          basicRent: 500, billingCycle: 'MONTHLY', rentalUnitId: 'apt-2' 
        }),
      );
      expect(wrapper.emitted('update:rentalAgreement')?.[0]).toEqual([updatedAgreement]);
      expect(toastSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
      expect(wrapper.emitted('update:visible')?.at(-1)).toEqual([false]);
    });

    it('treats a selected node without a title as active (empty title fallback)', async () => {
      const untitledNode = { key: 'apt-3', data: { id: 'apt-3', type: 'APARTMENT' as const, title: '' } };
      vi.mocked(propertyService.getPropertyTree).mockResolvedValue({ properties: [untitledNode] });

      const wrapper = mountDialog(null);
      await flushPromises();
      await wrapper.findComponent(TreeSelect).vm.$emit('node-select', untitledNode);
      await flushPromises();

      expect(wrapper.findComponent(RentalDetailsForm).exists()).toBe(true);
    });

    it('updates the tree selection via the RentableUnitSelect v-model and defaults excludeUnitIds when omitted', async () => {
      const wrapper = mount(AdjustRentDialog, {
        props: {
          visible: true, projectId: 'proj-1', agreementId: 'agreement-1', unit: null,
        },
        attachTo: document.body,
      });
      await flushPromises();

      const select = wrapper.findComponent(RentableUnitSelect);
      expect(select.props('excludeUnitIds')).toEqual([]);

      await select.vm.$emit('update:modelValue', 'apt-9');
      await flushPromises();

      expect(select.props('modelValue')).toBe('apt-9');
    });

    it('does not submit when the agreement id is missing', async () => {
      vi.mocked(propertyService.getPropertyTree).mockResolvedValue({
        properties: [{
          key: 'apt-2', data: {
            id: 'apt-2', type: 'APARTMENT', title: 'Wohnung 5'
          },
        }],
      });

      const wrapper = mount(AdjustRentDialog, {
        props: {
          visible: true, projectId: 'proj-1', agreementId: undefined, unit: null, excludeUnitIds: [],
        },
        attachTo: document.body,
      });
      await flushPromises();
      await wrapper.findComponent(TreeSelect).vm.$emit('node-select', {
        key: 'apt-2',
        data: {
          id: 'apt-2', type: 'APARTMENT', title: 'Wohnung 5'
        },
      });
      await flushPromises();

      await wrapper.findComponent(RentalDetailsForm).vm.$emit('submit', { billingCycle: 'MONTHLY' });
      await flushPromises();

      expect(rentalAgreementService.addRent).not.toHaveBeenCalled();
    });

    it('shows an error toast when adding fails with a non-Error rejection', async () => {
      vi.mocked(propertyService.getPropertyTree).mockResolvedValue({
        properties: [{
          key: 'apt-2', data: {
            id: 'apt-2', type: 'APARTMENT', title: 'Wohnung 5'
          },
        }],
      });
      vi.mocked(rentalAgreementService.addRent).mockRejectedValue('boom');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const wrapper = mountDialog(null);
      await flushPromises();
      await wrapper.findComponent(TreeSelect).vm.$emit('node-select', {
        key: 'apt-2',
        data: {
          id: 'apt-2', type: 'APARTMENT', title: 'Wohnung 5'
        },
      });
      await flushPromises();
      await wrapper.findComponent(RentalDetailsForm).vm.$emit('submit', { billingCycle: 'MONTHLY' });
      await flushPromises();

      expect(toastSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
      consoleSpy.mockRestore();
    });

    it('forwards BaseDialog update:visible events', async () => {
      const wrapper = mountDialog(null);
      await flushPromises();

      await wrapper.findComponent(BaseDialog).vm.$emit('update:visible', false);

      expect(wrapper.emitted('update:visible')?.[0]).toEqual([false]);
    });

    it('shows an error toast when adding fails', async () => {
      vi.mocked(propertyService.getPropertyTree).mockResolvedValue({
        properties: [{
          key: 'apt-2', data: {
            id: 'apt-2', type: 'APARTMENT', title: 'Wohnung 5' 
          },
        }],
      });
      vi.mocked(rentalAgreementService.addRent).mockRejectedValue(new Error('network error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const wrapper = mountDialog(null);
      await flushPromises();
      await wrapper.findComponent(TreeSelect).vm.$emit('node-select', {
        key: 'apt-2',
        data: {
          id: 'apt-2', type: 'APARTMENT', title: 'Wohnung 5' 
        },
      });
      await flushPromises();
      await wrapper.findComponent(RentalDetailsForm).vm.$emit('submit', { billingCycle: 'MONTHLY' });
      await flushPromises();

      expect(toastSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
      consoleSpy.mockRestore();
    });
  });

  describe('adjust mode (unit set)', () => {
    const unit: RentAdjustmentUnit = {
      unitId: 'prop-1',
      unitType: 'PROPERTY',
      unitTitle: 'Haupthaus',
      basicRent: 750,
      operatingCostsPrepayment: 120,
      heatingCostsPrepayment: 80,
      billingCycle: 'WEEKLY',
    };

    it('shows the dynamic adjust-rent header and no tree-select', async () => {
      mountDialog(unit);
      await flushPromises();

      expect(document.querySelector('.p-dialog-title')?.textContent).toContain('Haupthaus');
      expect(document.querySelector('.p-treeselect')).toBeNull();
    });

    it('prefills RentalDetailsForm from the unit', async () => {
      const wrapper = mountDialog(unit);
      await flushPromises();

      const form = wrapper.findComponent(RentalDetailsForm);
      expect(form.props('initialBasicRent')).toBe(750);
      expect(form.props('initialOperatingCostsPrepayment')).toBe(120);
      expect(form.props('initialHeatingCostsPrepayment')).toBe(80);
      expect(form.props('initialBillingCycle')).toBe('WEEKLY');
    });

    it('submits with the unit type/id, emits update, shows success toast, closes', async () => {
      const wrapper = mountDialog(unit);
      await flushPromises();

      await wrapper.findComponent(RentalDetailsForm).vm.$emit('submit', {
        basicRent: 900,
        billingCycle: 'MONTHLY',
      });
      await flushPromises();

      expect(rentalAgreementService.addRent).toHaveBeenCalledWith(
        'proj-1',
        'agreement-1',
        'PROPERTY',
        'prop-1',
        expect.objectContaining({
          basicRent: 900, billingCycle: 'MONTHLY', rentalUnitId: 'prop-1' 
        }),
      );
      expect(wrapper.emitted('update:rentalAgreement')?.[0]).toEqual([updatedAgreement]);
      expect(toastSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
      expect(wrapper.emitted('update:visible')?.at(-1)).toEqual([false]);
    });

    it('shows an error toast when adjusting fails', async () => {
      vi.mocked(rentalAgreementService.addRent).mockRejectedValue(new Error('network error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const wrapper = mountDialog(unit);
      await flushPromises();
      await wrapper.findComponent(RentalDetailsForm).vm.$emit('submit', { billingCycle: 'MONTHLY' });
      await flushPromises();

      expect(toastSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
      consoleSpy.mockRestore();
    });

    it('closes without submitting when RentalDetailsForm is cancelled', async () => {
      const wrapper = mountDialog(unit);
      await flushPromises();

      await wrapper.findComponent(RentalDetailsForm).vm.$emit('cancel');

      expect(wrapper.emitted('update:visible')?.[0]).toEqual([false]);
      expect(rentalAgreementService.addRent).not.toHaveBeenCalled();
    });
  });
});
