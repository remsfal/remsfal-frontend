import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AppClosedNotice from '@/layouts/components/AppClosedNotice.vue'
import { setAppMode } from '@/helper/appMode'

describe('layouts/components/AppClosedNotice.vue', () => {
  afterEach(() => setAppMode('DEVELOPMENT'))

  it('shows the logo and the construction message', () => {
    setAppMode('CONSTRUCTION')
    const wrapper = mount(AppClosedNotice)
    expect(wrapper.find('img').exists()).toBe(true)
    expect(wrapper.text()).toContain('bald hier verfügbar')
  })

  it('shows the maintenance message', () => {
    setAppMode('MAINTENANCE')
    const wrapper = mount(AppClosedNotice)
    expect(wrapper.text()).toContain('gewartet')
  })
})
