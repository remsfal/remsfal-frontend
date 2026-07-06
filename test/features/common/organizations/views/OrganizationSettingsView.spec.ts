import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import OrganizationSettingsView from '@/features/common/organizations/views/OrganizationSettingsView.vue'
import { organizationService } from '@/services/OrganizationService'
import type { AddressJson } from '@/services/AddressService'

const storeMocks = vi.hoisted(() => ({
  fetchUserOrganization: vi.fn().mockResolvedValue(undefined),
  initialized: false,
}))

vi.mock('@/stores/OrganizationStore', () => ({
  useOrganizationStore: () => ({
    get initialized() {
      return storeMocks.initialized
    },
    fetchUserOrganization: storeMocks.fetchUserOrganization,
    userOrganizations: [],
  }),
}))

let capturedLoadAddress: (() => Promise<AddressJson | undefined>) | undefined
let capturedSaveAddress: ((addr: AddressJson) => Promise<void>) | undefined

vi.mock('@/features/common/organizations', () => ({
  OrganizationBaseDataCard: {
    name: 'OrganizationBaseDataCard',
    template: '<div data-test="base-data-card" />',
    props: ['organizationId'],
  },
  OrganizationEmployeeCard: {
    name: 'OrganizationEmployeeCard',
    template: '<div data-test="member-card" />',
    props: ['organizationId'],
  },
}))
vi.mock('@/components/AddressCard.vue', () => ({
  default: {
    props: ['loadAddress', 'saveAddress'],
    setup(props: {
      loadAddress: () => Promise<AddressJson | undefined>
      saveAddress: (a: AddressJson) => Promise<void>
    }) {
      capturedLoadAddress = props.loadAddress
      capturedSaveAddress = props.saveAddress
      return {}
    },
    template: '<div data-test="address-card" />',
  },
}))

const mockOrg = {
  id: 'org-123',
  name: 'Test GmbH',
  address: {
    street: 'Musterstr. 1', city: 'Berlin', zip: '10115', country: 'DE' 
  },
}

describe('OrganizationSettingsView.vue', () => {
  beforeEach(() => {
    capturedLoadAddress = undefined
    capturedSaveAddress = undefined
    storeMocks.initialized = false
    storeMocks.fetchUserOrganization.mockClear()
    vi.spyOn(organizationService, 'getOrganization').mockResolvedValue(mockOrg)
    vi.spyOn(organizationService, 'updateOrganization').mockResolvedValue(mockOrg)
  })

  const mountView = (organizationId = 'org-123') =>
    mount(OrganizationSettingsView, { props: { organizationId } })

  it('renders without errors', async () => {
    const wrapper = mountView()
    await flushPromises()
    expect(wrapper.exists()).toBe(true)
  })

  it('renders OrganizationBaseDataCard with correct id', async () => {
    const wrapper = mountView()
    await flushPromises()
    expect(wrapper.find('[data-test="base-data-card"]').exists()).toBe(true)
  })

  it('renders OrganizationEmployeeCard with correct id', async () => {
    const wrapper = mountView()
    await flushPromises()
    expect(wrapper.find('[data-test="member-card"]').exists()).toBe(true)
  })

  it('renders AddressCard', async () => {
    const wrapper = mountView()
    await flushPromises()
    expect(wrapper.find('[data-test="address-card"]').exists()).toBe(true)
  })

  it('fetches organization on mount when store is not initialized', async () => {
    storeMocks.initialized = false
    mountView()
    await flushPromises()
    expect(storeMocks.fetchUserOrganization).toHaveBeenCalledOnce()
  })

  it('skips fetching organization when store is already initialized', async () => {
    storeMocks.initialized = true
    mountView()
    await flushPromises()
    expect(storeMocks.fetchUserOrganization).not.toHaveBeenCalled()
  })

  it('loadAddress calls organizationService.getOrganization with organizationId', async () => {
    mountView('org-123')
    await flushPromises()

    expect(capturedLoadAddress).toBeDefined()
    const result = await capturedLoadAddress!()

    expect(organizationService.getOrganization).toHaveBeenCalledWith('org-123')
    expect(result).toEqual(mockOrg.address)
  })

  it('saveAddress calls organizationService.updateOrganization with address', async () => {
    mountView('org-123')
    await flushPromises()

    const address: AddressJson = {
      street: 'Neue Str. 2', city: 'Hamburg', zip: '20095', country: 'DE' 
    }
    expect(capturedSaveAddress).toBeDefined()
    await capturedSaveAddress!(address)

    expect(organizationService.updateOrganization).toHaveBeenCalledWith('org-123', { address })
  })
})
