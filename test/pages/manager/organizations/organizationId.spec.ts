import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { reactive } from 'vue'
import { routeLocationKey } from 'vue-router'
import router from '@/router'
import { config } from '@vue/test-utils'
import ManagerOrganizationSettingsPage from '@/pages/manager/organizations/[organizationId].vue'

config.global.plugins = config.global.plugins.filter((p) => p !== router)

vi.mock('@/features/common/organizations', () => ({
  OrganizationSettingsView: {
    name: 'OrganizationSettingsView',
    template: '<div data-test="org-settings-view" />',
    props: ['organizationId'],
  },
}))

describe('manager/organizations/[organizationId].vue', () => {
  const mountPage = (organizationId = 'org-123') => {
    const route = reactive({
      path: `/manager/organizations/${organizationId}`,
      name: 'ManagerOrganizationSettings',
      params: { organizationId },
      query: {},
    })
    return mount(ManagerOrganizationSettingsPage, {global: {provide: { [routeLocationKey as symbol]: route },},})
  }

  it('renders without errors', () => {
    const wrapper = mountPage()
    expect(wrapper.exists()).toBe(true)
  })

  it('renders OrganizationSettingsView', () => {
    const wrapper = mountPage()
    expect(wrapper.find('[data-test="org-settings-view"]').exists()).toBe(true)
  })

  it('passes organizationId prop to OrganizationSettingsView', async () => {
    const wrapper = mountPage('org-789')
    await wrapper.vm.$nextTick()
    const view = wrapper.findComponent({ name: 'OrganizationSettingsView' })
    expect(view.props('organizationId')).toBe('org-789')
  })
})
