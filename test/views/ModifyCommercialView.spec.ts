import { mount, VueWrapper } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import Component from '../../src/views/ModifyCommercialView.vue';
import { commercialService } from '../../src/services/CommercialService';

const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock('../../src/services/CommercialService', () => ({
  commercialService: {
    getCommercial: vi.fn(),
    updateCommercial: vi.fn(),
  },
}));

describe('ModifyCommercialView.vue', () => {
  let wrapper: VueWrapper<any>

  beforeEach(async () => {
    (commercialService.getCommercial as Mock).mockResolvedValue({
      title: 'Initial Commercial Title',
      description: 'Initial Commercial Description',
      commercialSpace: 100,
      heatingSpace: 1,
      location: '',
    });

    wrapper = mount(Component, {
      props: {
        projectId: 'project1',
        unitId: 'commercial1',
      },
    });

    // wait for any onMounted async calls
    await wrapper.vm.$nextTick();
  });

  it('loads commercial details on mount', () => {
    expect(wrapper.vm.title).toBe('Initial Commercial Title');
    expect(wrapper.vm.description).toBe('Initial Commercial Description');
    expect(wrapper.vm.commercialSpace).toBe(100);
    expect(wrapper.vm.heatingSpace).toBe(1);
    expect(wrapper.vm.location).toBe('');
  });

  it('validates commercial space is positive', async () => {
    wrapper.vm.commercialSpace = -10;
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.validationErrors).toContain('Gewerbefläche darf nicht negativ sein.');
    expect(wrapper.vm.isValid).toBe(false);
  });

  it('validates heating space is positive', async () => {
    wrapper.vm.heatingSpace = -5;
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.validationErrors).toContain('Heizfläche darf nicht negativ sein.');
    expect(wrapper.vm.isValid).toBe(false);
  });

  it('detects changes correctly', async () => {
    expect(wrapper.vm.hasChanges).toBe(false); // keine Änderungen nach Laden

    wrapper.vm.title = 'Neuer Titel';
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.hasChanges).toBe(true); // Änderung erkannt
  });

  it('does not call updateCommercial if validation fails', async () => {
    wrapper.vm.commercialSpace = -1; // invalid
    await wrapper.vm.save();
    expect(commercialService.updateCommercial).not.toHaveBeenCalled();
  });

  it('calls updateCommercial with correct data when saved', async () => {
    (commercialService.updateCommercial as Mock).mockResolvedValue({});

    // Werte ändern
    wrapper.vm.title = 'Neuer Titel';
    wrapper.vm.description = 'Neue Beschreibung';
    wrapper.vm.commercialSpace = 150;
    wrapper.vm.heatingSpace = 50;

    await wrapper.vm.save();

    expect(commercialService.updateCommercial).toHaveBeenCalledWith(
      'project1',
      'commercial1',
      expect.objectContaining({
        title: 'Neuer Titel',
        description: 'Neue Beschreibung',
        commercialSpace: 150,
        heatingSpace: 50,
        location: '',
      }),
    );
  });
});
