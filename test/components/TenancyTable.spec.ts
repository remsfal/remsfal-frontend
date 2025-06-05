import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TenancyTable from '@/components/TenancyTable.vue'

describe('TenancyTable.vue', () => {
  it('renders the tab buttons', () => {
    const wrapper = mount(TenancyTable)
    const tabs = wrapper.findAll('button')
    expect(tabs.length).toBeGreaterThan(0)
    expect(wrapper.text()).toContain('Alle')
  })

  it('renders the table structure', () => {
    const wrapper = mount(TenancyTable)
    expect(wrapper.find('table').exists()).toBe(true)
  })
})
