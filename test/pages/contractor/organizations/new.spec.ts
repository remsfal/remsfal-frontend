import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ContractorOrganizationsPage from '@/pages/contractor/organizations/new.vue'

vi.mock('@/features/common/organizations', () => ({OrganizationsView: { template: '<div data-test="organizations-view" />' },}))

describe('contractor/organizations/new.vue', () => {
  it('renders without errors', () => {
    const wrapper = mount(ContractorOrganizationsPage)
    expect(wrapper.exists()).toBe(true)
  })

  it('renders OrganizationsView', () => {
    const wrapper = mount(ContractorOrganizationsPage)
    expect(wrapper.find('[data-test="organizations-view"]').exists()).toBe(true)
  })
})
