import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TenancyView from '@/views/TenancyView.vue'

describe('TenancyView.vue', () => {
  it('mounts and renders the heading', () => {
    const wrapper = mount(TenancyView)
    expect(wrapper.text()).toContain('Mängelübersicht')
  })
})
