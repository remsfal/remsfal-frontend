import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { reactive } from 'vue'
import { routeLocationKey } from 'vue-router'
import router from '@/router'
import { config } from '@vue/test-utils'
import ContractorOrderDetailsPage from '@/pages/contractor/orders/[issueId].vue'

config.global.plugins = config.global.plugins.filter((p) => p !== router)

vi.mock('@/features/contractor/orderManagement', () => ({
  OrderManagementDetailsView: {
    name: 'OrderManagementDetailsView',
    template: '<div data-test="quotation-request-detail-view" />',
    props: ['issueId'],
  },
}))

describe('contractor/orders/[issueId].vue', () => {
  const mountPage = (issueId = 'issue-123') => {
    const route = reactive({
      path: `/contractor/orders/${issueId}`,
      name: 'ContractorOrderDetails',
      params: { issueId },
      query: {},
    })
    return mount(ContractorOrderDetailsPage, { global: { provide: { [routeLocationKey as symbol]: route } } })
  }

  it('renders without errors', () => {
    const wrapper = mountPage()
    expect(wrapper.exists()).toBe(true)
  })

  it('renders OrderManagementDetailsView', () => {
    const wrapper = mountPage()
    expect(wrapper.find('[data-test="quotation-request-detail-view"]').exists()).toBe(true)
  })

  it('passes issueId prop to OrderManagementDetailsView', async () => {
    const wrapper = mountPage('issue-456')
    await wrapper.vm.$nextTick()
    const view = wrapper.findComponent({ name: 'OrderManagementDetailsView' })
    expect(view.props('issueId')).toBe('issue-456')
  })
})
