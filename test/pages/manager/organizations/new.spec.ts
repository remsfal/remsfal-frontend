import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ManagerOrganizationsPage from '@/pages/manager/organizations/new.vue'

vi.mock('@/features/common/organizations', () => ({OrganizationsView: { template: '<div data-test="organizations-view" />' },}))

describe('manager/organizations/new.vue', () => {
  it('renders without errors', () => {
    const wrapper = mount(ManagerOrganizationsPage)
    expect(wrapper.exists()).toBe(true)
  })

  it('renders OrganizationsView', () => {
    const wrapper = mount(ManagerOrganizationsPage)
    expect(wrapper.find('[data-test="organizations-view"]').exists()).toBe(true)
  })
})
