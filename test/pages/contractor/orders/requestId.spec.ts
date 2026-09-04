import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { reactive } from 'vue'
import { routeLocationKey } from 'vue-router'
import router from '@/router'
import { config } from '@vue/test-utils'
import ContractorOrderDetailsPage from '@/pages/contractor/orders/[requestId].vue'

config.global.plugins = config.global.plugins.filter((p) => p !== router)

vi.mock('@/features/contractor/orderManagement', () => ({
  QuotationRequestDetailView: {
    name: 'QuotationRequestDetailView',
    template: '<div data-test="quotation-request-detail-view" />',
    props: ['requestId'],
  },
}))

describe('contractor/orders/[requestId].vue', () => {
  const mountPage = (requestId = 'request-123') => {
    const route = reactive({
      path: `/contractor/orders/${requestId}`,
      name: 'ContractorOrderDetails',
      params: { requestId },
      query: {},
    })
    return mount(ContractorOrderDetailsPage, { global: { provide: { [routeLocationKey as symbol]: route } } })
  }

  it('renders without errors', () => {
    const wrapper = mountPage()
    expect(wrapper.exists()).toBe(true)
  })

  it('renders QuotationRequestDetailView', () => {
    const wrapper = mountPage()
    expect(wrapper.find('[data-test="quotation-request-detail-view"]').exists()).toBe(true)
  })

  it('passes requestId prop to QuotationRequestDetailView', async () => {
    const wrapper = mountPage('request-456')
    await wrapper.vm.$nextTick()
    const view = wrapper.findComponent({ name: 'QuotationRequestDetailView' })
    expect(view.props('requestId')).toBe('request-456')
  })
})
