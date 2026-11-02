import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AuthLayout from '@/layouts/auth.vue'

describe('layouts/auth.vue', () => {
  it('renders slot content', () => {
    const wrapper = mount(AuthLayout, { slots: { default: '<div data-test="page-content">Login</div>' } })
    expect(wrapper.find('[data-test="page-content"]').exists()).toBe(true)
  })

  it('renders neither topbar, sidebar nor footer', () => {
    const wrapper = mount(AuthLayout)
    expect(wrapper.find('.layout-topbar').exists()).toBe(false)
    expect(wrapper.find('.layout-sidebar').exists()).toBe(false)
    expect(wrapper.find('footer').exists()).toBe(false)
  })
})
