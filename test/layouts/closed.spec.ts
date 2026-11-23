import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ClosedLayout from '@/layouts/closed.vue'

describe('layouts/closed.vue', () => {
  it('renders slot content and the footer', () => {
    const wrapper = mount(ClosedLayout, { slots: { default: '<div data-test="page-content">Imprint</div>' } })
    expect(wrapper.find('[data-test="page-content"]').exists()).toBe(true)
    expect(wrapper.find('footer').exists()).toBe(true)
  })

  it('renders neither topbar nor sidebar', () => {
    const wrapper = mount(ClosedLayout)
    expect(wrapper.find('.layout-topbar').exists()).toBe(false)
    expect(wrapper.find('.layout-sidebar').exists()).toBe(false)
  })
})
