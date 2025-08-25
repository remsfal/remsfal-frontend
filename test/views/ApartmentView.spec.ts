import { describe, it, expect, vi, beforeAll, afterAll, afterEach, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ApartmentView from '../../src/views/ApartmentView.vue'
import { setupServer } from 'msw/node'
import { handlers } from '../mocks/handlers' // your existing MSW handlers

// Setup MSW server with existing handlers
const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

vi.mock('primevue/usetoast', () => ({
  useToast: () => ({ add: vi.fn() }),
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

describe('ApartmentView.vue', () => {
  let wrapper: any

  beforeEach(async () => {
    wrapper = mount(ApartmentView, {
      props: { projectId: 'project1', unitId: 'unit1' },
    })
    await flushPromises() // wait for fetchApartment to resolve
  })

  it('loads apartment details from MSW', () => {
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
    // change some values
    wrapper.vm.title = 'Updated Title'
    wrapper.vm.description = 'Updated Description'

    const updateSpy = vi.spyOn(wrapper.vm.apartmentService, 'updateApartment')
    await wrapper.vm.save()

    expect(updateSpy).toHaveBeenCalledWith(
      'project1',
      'unit1',
      expect.objectContaining({ title: 'Updated Title', description: 'Updated Description' })
    )
  })
})
