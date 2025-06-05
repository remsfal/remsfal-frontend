import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TenancyMenu from '@/layout/TenancyMenu.vue'

describe('TenancyMenu.vue', () => {
  it('renders menu items', () => {
    const wrapper = mount(TenancyMenu)
    expect(wrapper.findAll('li').length).toBeGreaterThan(0)
  })
})
