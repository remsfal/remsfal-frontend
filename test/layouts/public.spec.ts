import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import PublicLayout from '@/layouts/public.vue'
import ManagerTopbar from '@/layouts/components/ManagerTopbar.vue'
import AppFooter from '@/layouts/components/AppFooter.vue'

const mocks = vi.hoisted(() => ({ setFullscreen: vi.fn() }))

vi.mock('@/layouts/composables/layout', () => ({useLayout: () => ({setFullscreen: mocks.setFullscreen,}),}))

vi.mock('@/layouts/components/ManagerTopbar.vue', () => ({ default: { template: '<div data-test="manager-topbar" />' } }))
vi.mock('@/layouts/components/AppFooter.vue', () => ({ default: { template: '<div data-test="app-footer" />' } }))

describe('layouts/public.vue', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders ManagerTopbar', async () => {
    const wrapper = mount(PublicLayout)
    await flushPromises()
    expect(wrapper.findComponent(ManagerTopbar).exists()).toBe(true)
  })

  it('renders AppFooter', async () => {
    const wrapper = mount(PublicLayout)
    await flushPromises()
    expect(wrapper.findComponent(AppFooter).exists()).toBe(true)
  })

  it('renders slot content', async () => {
    const wrapper = mount(PublicLayout, {slots: { default: '<div data-test="page-content">Seite</div>' },})
    await flushPromises()
    expect(wrapper.find('[data-test="page-content"]').exists()).toBe(true)
  })

  it('calls setFullscreen(true) on mount', async () => {
    mount(PublicLayout)
    await flushPromises()
    expect(mocks.setFullscreen).toHaveBeenCalledWith(true)
  })

  it('renders layout-wrapper element', async () => {
    const wrapper = mount(PublicLayout)
    await flushPromises()
    expect(wrapper.find('.layout-wrapper').exists()).toBe(true)
  })
})
