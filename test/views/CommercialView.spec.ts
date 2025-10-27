import { mount, VueWrapper } from '@vue/test-utils';
import {describe, it, expect, vi, beforeEach, Mock} from 'vitest';
import Component from '../../src/views/CommercialView.vue';
import { commercialService } from '../../src/services/CommercialService';

const mockPush = vi.fn();
vi.mock('vue-router', () => ({useRouter: () => ({push: mockPush,}),}));

vi.mock('../../src/services/CommercialService', () => ({
  commercialService: {
    getCommercial: vi.fn(),
    updateCommercial: vi.fn(),
  },
}));

describe('CommercialView.vue', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(async () => {
    (commercialService.getCommercial as Mock).mockResolvedValue({
      title: 'Initial Commercial Title',
      description: 'Initial Commercial Description',
      netFloorArea: 100,
      technicalServicesArea: 1,
      location: '',
    });

    wrapper = mount(Component, {
      props: {
        projectId: 'project1',
        unitId: 'commercial1',
      },
    });

    await wrapper.vm.$nextTick();
  });

  it('loads commercial details on mount', () => {
    expect(wrapper.vm.title).toBe('Initial Commercial Title');
    expect(wrapper.vm.description).toBe('Initial Commercial Description');
    expect(wrapper.vm.commercialSpace).toBe(100); // mapped from netFloorArea
    expect(wrapper.vm.heatingSpace).toBe(1);      // mapped from technicalServicesArea
    expect(wrapper.vm.location).toBe('');
  });

  it('validates commercial space is positive, heating space is positive and description is not over 500 characters', async () => {
    wrapper.vm.commercialSpace = -10;
    wrapper.vm.heatingSpace = -5;
    wrapper.vm.description = 'a'.repeat(501);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.validationErrors).toContain('Gewerbefläche darf nicht negativ sein.');
    expect(wrapper.vm.validationErrors).toContain('Heizfläche darf nicht negativ sein.');
    expect(wrapper.vm.validationErrors).toContain(
      'Beschreibung darf maximal 500 Zeichen lang sein.',
    );
    expect(wrapper.vm.isValid).toBe(false);
  });

  it('detects changes correctly', async () => {
    expect(wrapper.vm.hasChanges).toBe(false);

    wrapper.vm.title = 'Neuer Titel';
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.hasChanges).toBe(true);
  });

  it('does not call updateCommercial if validation fails', async () => {
    wrapper.vm.commercialSpace = -1;
    await wrapper.vm.save();
    expect(commercialService.updateCommercial).not.toHaveBeenCalled();
  });

  it('calls updateCommercial with correct data when saved', async () => {
    (commercialService.updateCommercial as Mock).mockResolvedValue({});

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
        netFloorArea: 150,  // updated key
        heatingSpace: 50,
        location: '',
      }),
    );
  });

  it('returns early if there is no projectId', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const wrapper = mount(Component, {props: { projectId: '', unitId: 'commercial1' },});
    await wrapper.vm.fetchCommercialDetails();
    expect(errorSpy).toHaveBeenCalledWith('Keine projectId');
    errorSpy.mockRestore();
  });

  it('returns early if there is no unitId', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const wrapper = mount(Component, {props: { projectId: 'project1', unitId: '' },});
    await wrapper.vm.fetchCommercialDetails();
    expect(errorSpy).toHaveBeenCalledWith('Keine unitId');
    errorSpy.mockRestore();
  });
});
