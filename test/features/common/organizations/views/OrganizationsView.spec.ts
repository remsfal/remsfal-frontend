import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import OrganizationsView from '@/features/common/organizations/views/OrganizationsView.vue'

vi.mock('@/features/common/organizations', () => ({
  OrganizationBenefitsCard: {
    name: 'OrganizationBenefitsCard',
    template: '<div data-test="benefits-card" />',
    props: [],
  },
}))

describe('OrganizationsView.vue', () => {
  it('renders without errors', () => {
    const wrapper = mount(OrganizationsView)
    expect(wrapper.exists()).toBe(true)
  })

  it('renders OrganizationBenefitsCard', () => {
    const wrapper = mount(OrganizationsView)
    expect(wrapper.find('[data-test="benefits-card"]').exists()).toBe(true)
  })
})
