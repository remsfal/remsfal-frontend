import {describe, it, expect, vi, beforeEach} from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ApartmentView from '../../src/views/ApartmentView.vue'
import { apartmentService } from '../../src/services/ApartmentService'

const mockPush = vi.fn();

vi.mock('primevue/usetoast', () => ({useToast: () => ({ add: vi.fn() }),}))

vi.mock('vue-router', () => ({useRouter: () => ({ push: mockPush }),}))

describe('ApartmentView.vue', () => {
  let wrapper: any

  const mockApartment = {
    title: 'Initial Apartment Title',
    description: 'Initial Apartment Description',
    livingSpace: 100,
    usableSpace: 80,
    heatingSpace: 60,
    location: 'Initial Location',
  }

  beforeEach(async () => {
    // Mock service methods
    vi.spyOn(apartmentService, 'getApartment').mockResolvedValue(mockApartment)
    vi.spyOn(apartmentService, 'updateApartment').mockResolvedValue(mockApartment)

    wrapper = mount(ApartmentView, {props: { projectId: 'project1', unitId: 'unit1' },})

    await flushPromises() // wait for fetchApartment
  })

  it('loads apartment details', () => {
    expect(wrapper.vm.title).toBe('Initial Apartment Title')
    expect(wrapper.vm.description).toBe('Initial Apartment Description')
    expect(wrapper.vm.livingSpace).toBe(100)
    expect(wrapper.vm.usableSpace).toBe(80)
    expect(wrapper.vm.heatingSpace).toBe(60)
    expect(wrapper.vm.location).toBe('Initial Location')
  })

  it('validates negative values correctly', async () => {
    wrapper.vm.livingSpace = -10
    wrapper.vm.usableSpace = -5
    wrapper.vm.heatingSpace = -3
    await flushPromises()

    expect(wrapper.vm.validationErrors).toContain('Wohnfläche darf nicht negativ sein.')
    expect(wrapper.vm.validationErrors).toContain('Nutzfläche darf nicht negativ sein.')
    expect(wrapper.vm.validationErrors).toContain('Heizfläche darf nicht negativ sein.')
    expect(wrapper.vm.isValid).toBe(false)
  })

  it('calls updateApartment on save', async () => {
    wrapper.vm.title = 'Updated Title'
    wrapper.vm.description = 'Updated Description'

    const updateSpy = vi.spyOn(apartmentService, 'updateApartment')
    await wrapper.vm.save()

    expect(updateSpy).toHaveBeenCalledWith(
      'project1',
      'unit1',
      expect.objectContaining({
        title: 'Updated Title',
        description: 'Updated Description'
      })
    )
  })

  it('redirects to correct apartment view path after successful save', async () => {
    mockPush.mockClear()
    wrapper.vm.title = 'Updated Title'
    
    await wrapper.vm.save()
    await flushPromises()

    expect(mockPush).toHaveBeenCalledWith('/projects/project1/units/apartment/unit1')
  })
})
