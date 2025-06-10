import { mount, VueWrapper } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import Component from '../../src/views/ModifyBuildingView.vue'
import { buildingService } from '../../src/services/BuildingService'

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('@/services/BuildingService', () => ({
  buildingService: {
    getBuilding: vi.fn(),
    updateBuilding: vi.fn(),
  },
}));

describe('ModifyBuildingView.vue', () => {
  let wrapper: VueWrapper<any>

  beforeEach(async () => {
    (buildingService.getBuilding as Mock).mockResolvedValue({
      title: 'Initial Title',
      description: 'Initial Description',
      livingSpace: 100,
      commercialSpace: 50,
      usableSpace: 75,
      heatingSpace: 60,
      address: {
        street: 'Street 1',
        city: 'City',
        province: 'Province',
        zip: '12345',
        country: 'DE',
      },
    });

    wrapper = mount(Component, {
      props: {
        projectId: 'project1',
        unitId: 'unit1',
      },
    });

    // wait for any onMounted async calls
    await wrapper.vm.$nextTick()
  });

  it('shows validation error if livingSpace is negative and blocks save', async () => {
    wrapper.vm.livingSpace = -10
    await wrapper.vm.$nextTick()

    await wrapper.vm.save()

    expect(wrapper.vm.validationErrors).toContain('Wohnfläche darf nicht negativ sein.')
    expect(buildingService.updateBuilding).not.toHaveBeenCalled()
  });

  it('shows validation error if commercialSpace is negative and blocks save', async () => {
    wrapper.vm.commercialSpace = -5
    await wrapper.vm.$nextTick()

    await wrapper.vm.save()

    expect(wrapper.vm.validationErrors).toContain('Gewerbefläche darf nicht negativ sein.')
    expect(buildingService.updateBuilding).not.toHaveBeenCalled()
  });

  it('cancel calls window.close when window.opener exists', () => {
    window.close = vi.fn()

    Object.defineProperty(window, 'opener', {
      value: {},
      writable: true,
    })

    wrapper.vm.cancel()

    expect(window.close).toHaveBeenCalled()
  })

  it('validates that livingSpace is not negative', async () => {
    wrapper.vm.livingSpace = -1
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.validationErrors).toContain('Wohnfläche darf nicht negativ sein.')
    expect(wrapper.vm.isValid).toBe(false)
  })

  it('validates that commercialSpace is not negative', async () => {
    wrapper.vm.commercialSpace = -2
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.validationErrors).toContain('Gewerbefläche darf nicht negativ sein.')
    expect(wrapper.vm.isValid).toBe(false)
  })

  it('validates that usableSpace is not negative', async () => {
    wrapper.vm.usableSpace = -3
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.validationErrors).toContain('Nutzfläche darf nicht negativ sein.')
    expect(wrapper.vm.isValid).toBe(false)
  })

  it('validates that heatingSpace is not negative', async () => {
    wrapper.vm.heatingSpace = -4
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.validationErrors).toContain('Heizfläche darf nicht negativ sein.')
    expect(wrapper.vm.isValid).toBe(false)
  })

  it('validates no errors when all values are zero or positive', async () => {
    wrapper.vm.livingSpace = 0
    wrapper.vm.commercialSpace = 0
    wrapper.vm.usableSpace = 0
    wrapper.vm.heatingSpace = 0
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.validationErrors.length).toBe(0)
    expect(wrapper.vm.isValid).toBe(true)
  })

  it('calls getBuilding on mount and sets data correctly', async () => {
    expect(buildingService.getBuilding).toHaveBeenCalledWith('project1', 'unit1')
    expect(wrapper.vm.title).toBe('Initial Title')
  })

})
